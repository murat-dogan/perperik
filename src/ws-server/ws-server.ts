import * as https from 'https';
import { readFileSync } from 'fs';
import * as ws from 'ws';
import { getLogger } from 'log4js';
import * as url from 'url';
import { add2Map } from '../client/client';
import generateClientID from '../helpers/generate-client-id';
import { OutgoingMessageWelcome } from '../message/message-types';
import { SocketExtended } from '../socket/socket';
import generateUniqueID from '../helpers/generate-unique-id';

const logger = getLogger('ws-server');

let httpsServer: https.Server = null;
let wsServer: ws.Server = null;

export function createWSServer(certPath: string, keyPath: string, wsPort: string | number): void {
    // create https server
    httpsServer = https.createServer({
        cert: readFileSync(certPath),
        key: readFileSync(keyPath),
    });

    // create wss server
    wsServer = new ws.WebSocketServer({ server: httpsServer });

    wsServer.on('connection', (socket: SocketExtended, req) => {
        logger.debug(`New connection from ${req.socket.remoteAddress}`);
        const searchParamsStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const searchParams = new url.URLSearchParams(searchParamsStr);

        const clientID = searchParams.get('id') || generateClientID();
        socket.pkUniqueID = generateUniqueID();
        socket.pkID = clientID;
        add2Map(clientID, socket);

        // Send client id
        const msg: OutgoingMessageWelcome = {
            type: 'welcome',
            id: clientID,
        };
        socket.send(JSON.stringify(msg), (err) => {
            if (err) logger.error(`Error on send welcome msg. Client: ${clientID} Err:`, err);
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

    httpsServer.listen(wsPort);
}
