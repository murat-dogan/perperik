import * as https from 'https';
import { readFileSync } from 'fs';
import * as ws from 'ws';
import { getLogger } from 'log4js';
import { add2Map } from './client';
import generateClientName from '../helpers/generate-client-name';
import { OutgoingMessageWelcome } from './message';

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

    wss.on('connection', (socket, req) => {
        logger.debug(`New connection from ${req.socket.remoteAddress}`);

        const clientName = generateClientName();
        add2Map(clientName, socket);

        // Send client name
        const msg: OutgoingMessageWelcome = {
            type: 'welcome',
            clientName,
        };
        socket.send(JSON.stringify(msg), (err) => {
            if (err) console.log(err);
        });
    });

    wss.on('close', () => {
        logger.info(`WSS Closed`);
    });

    wss.on('listening', () => {
        logger.info(`WSS listening on port ${wsPort}`);
    });

    wss.on('error', (err) => {
        logger.error(`WSS error:`, err);
    });

    httpsServer.listen(wsPort);
}
