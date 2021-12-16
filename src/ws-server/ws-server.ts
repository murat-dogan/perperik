import * as http from 'http';
import * as ws from 'ws';
import { getLogger } from 'log4js';
import * as url from 'url';
import { add2Map } from '../client/client';
import generateClientID from '../helpers/generate-client-id';
import { Message2ClientWelcome } from '../message/message-types';
import { SocketExtended } from '../socket/socket';
import generateUniqueID from '../helpers/generate-unique-id';
import { consumeNewConnectionByIPLimit } from '../rate-limit/rate-limiter';
import { generateErrorMsg } from '../message/message';
import commonErrors from '../error/common-errors';
import * as pkg from '../../package.json';

const logger = getLogger('ws-server');

let httpServer: http.Server = null;
let wsServer: ws.Server = null;

export function createWSServer(wsPort: string | number): void {
    // create https server
    httpServer = http.createServer((req, res) => {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
        });
        res.end(
            `This is an instance of perperik signaling server. Please check https://github.com/murat-dogan/perperik for details (V${pkg.version})`,
        );
    });

    // create wss server
    wsServer = new ws.WebSocketServer({ server: httpServer });

    wsServer.on('connection', (socket: SocketExtended, req) => {
        logger.debug(`New connection attempt from ${req.socket.remoteAddress}`);

        // Check ip rate limit
        consumeNewConnectionByIPLimit(req.socket.remoteAddress)
            .then(() => {
                const searchParamsStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
                const searchParams = new url.URLSearchParams(searchParamsStr);

                let urlModified = req.url;
                if (urlModified.includes('?')) urlModified = urlModified.substring(0, urlModified.indexOf('?'));
                const urlSplitted = urlModified.split('/');
                const idFromUrl = urlSplitted.length > 1 && urlSplitted[1] ? urlSplitted[1] : null;

                // Client ID could be set from url or as a query parameter named id
                // If no client id provided a random one will be generated
                const clientID = idFromUrl || searchParams.get('id') || generateClientID();

                if (clientID.length < 4) {
                    socket.send(JSON.stringify(generateErrorMsg(commonErrors.ID_MIN_LENGTH_IS_4, clientID)), (err) => {
                        if (err) logger.error(`Error on send err msg. Err:`, err);
                    });
                    return;
                }

                socket.pkUniqueID = generateUniqueID();
                socket.pkID = clientID;
                add2Map(clientID, socket);

                // Send welcome msg & assigned client id
                const msg: Message2ClientWelcome = {
                    type: 'pk-welcome',
                    id: clientID,
                };
                socket.send(JSON.stringify(msg), (err) => {
                    if (err) logger.error(`Error on send welcome msg. ID: ${clientID} Err:`, err);
                });
            })
            .catch(() => {
                // Rate Limit exceeded
                logger.info(`IP Rate Limit Exceeded for ${req.socket.remoteAddress}. Connection refused.`);
                socket.send(
                    JSON.stringify(
                        generateErrorMsg(commonErrors.IP_CONN_RATE_LIMIT_EXCEEDED, req.socket.remoteAddress),
                    ),
                    (err) => {
                        if (err) logger.error(`Error on send err msg. Err:`, err);
                    },
                );
            });
    });

    wsServer.on('close', () => {
        logger.info(`WS Closed`);
    });

    wsServer.on('listening', () => {
        logger.info(`WS listening on port ${wsPort}`);
    });

    wsServer.on('error', (err) => {
        logger.error(`WS error:`, err);
    });

    httpServer.listen(wsPort);
}
