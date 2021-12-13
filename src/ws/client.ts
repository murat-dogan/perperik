import * as ws from 'ws';
import { getLogger } from 'log4js';

const logger = getLogger('client');

const clientMap: { [index: string]: ws } = {};

export function add2Map(name: string, socket: ws): void {
    logger.info(`${name}# New Connection`);

    clientMap[name] = socket;

    socket.on('close', (code) => {
        logger.info(`${name}# Socket closed (code: ${code})`);
        removeFromMap(name);
    });

    socket.on('error', (err) => {
        logger.error(`${name}# Socket error:`, err);
    });

    socket.on('message', (data) => {
        logger.debug('${name}# received: %s', data);
    });
}

export function removeFromMap(name: string): void {
    if (clientMap[name] && clientMap[name].readyState == ws.WebSocket.OPEN) clientMap[name].terminate();
    delete clientMap[name];
}
