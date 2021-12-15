import * as https from 'https';
import { readFileSync } from 'fs';
import * as ws from 'ws';
import { getLogger } from 'log4js';
import * as url from 'url';
import { add2Map } from '../client/client';
import generateClientName from '../helpers/generate-client-name';
import { OutgoingMessageWelcome } from '../message/message-types';
import { SocketExtended } from '../socket/socket';
import generateUniqueID from '../helpers/generate-unique-id';

const logger = getLogger('ws');

let httpsServer: https.Server = null;
let wss: ws.Server = null;

export function createWSServer(certPath: string, keyPath: string, wsPort: string | number): void {
    // create https server
    httpsServer = https.createServer({
        cert: readFileSync(certPath),
        key: readFileSync(keyPath),
    });

    // create wss server
    wss = new ws.WebSocketServer({ server: httpsServer });

    wss.on('connection', (socket: SocketExtended, req) => {
        logger.debug(`New connection from ${req.socket.remoteAddress}`);
        const searchParamsStr = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        const searchParams = new url.URLSearchParams(searchParamsStr);

        const clientName = searchParams.get('name') || generateClientName();
        socket.pkUniqueID = generateUniqueID();
        socket.pkName = clientName;
        add2Map(clientName, socket);

        // Send client name
        const msg: OutgoingMessageWelcome = {
            type: 'welcome',
            clientName,
        };
        socket.send(JSON.stringify(msg), (err) => {
            if (err) logger.error(`Error on send. Client: ${clientName} Err:`, err);
        });
    });

    wss.on('close', () => {
        logger.info(`WS Closed`);
    });

    wss.on('listening', () => {
        logger.info(`WS listening on port ${wsPort}`);
    });

    wss.on('error', (err) => {
        logger.error(`WS error:`, err);
    });

    httpsServer.listen(wsPort);
}