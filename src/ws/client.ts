import * as ws from 'ws';
import { getLogger } from 'log4js';
import {
    commonErrors,
    generateErrorMsg,
    IncomingMessage2Peer,
    IncomingMessage2Server,
    OutgoingMessage,
    OutgoingMessagePeer,
} from './message';

const logger = getLogger('client');

const clientMap: { [index: string]: ws } = {};

export function add2Map(name: string, socket: ws): void {
    logger.info(`${name}# New Connection`);

    clientMap[name] = socket;
    registerCallbacks(name, socket);
}

export function removeFromMap(name: string): void {
    if (clientMap[name] && clientMap[name].readyState == ws.WebSocket.OPEN) clientMap[name].terminate();
    delete clientMap[name];
}

function registerCallbacks(name: string, socket: ws): void {
    socket.on('close', (code) => {
        logger.info(`${name}# Socket closed (code: ${code})`);
        removeFromMap(name);
    });

    socket.on('error', (err) => {
        logger.error(`${name}# Socket error:`, err);
    });

    socket.on('message', (data) => {
        try {
            const msg: IncomingMessage2Peer | IncomingMessage2Server = JSON.parse(data.toString());
            if (!msg || !msg.type) {
                logger.error(`${name}# Wrong message format. Received: ${JSON.stringify(data.toString() || {})}`);
                return;
            }

            logger.debug(`${name}# Received: ${JSON.stringify(msg)}`);

            switch (msg.type) {
                case 'peer-msg':
                    handlePeerMsg(name, msg);
                    break;

                case 'server-msg':
                    break;

                default:
                    logger.error(`${name}# Unknown message type. Received: ${JSON.stringify(data)}`);
                    return;
            }
        } catch (err) {
            logger.error(
                `${name}# Error thrown while processing the received message. Received Data: ${JSON.stringify(
                    data.toString() || {},
                )} Err:`,
                err,
            );
        }
    });
}

function handlePeerMsg(name: string, msg: IncomingMessage2Peer): void {
    const peerName = msg.peerName;
    const peer = clientMap[peerName];

    // Check if peer is online
    if (!peer) {
        logger.error(`${name}# Trying to send peer-msg to ${peerName} but it does not seem online. `);
        sendMessage(name, generateErrorMsg(commonErrors.PEER_NOT_ONLINE, peerName));
        return;
    }

    // Check if socket is still open
    if (peer.readyState !== ws.WebSocket.OPEN) {
        logger.error(`${name}# Trying to send peer-msg to ${peerName} but socket does not seem open. Removing ... `);
        removeFromMap(peerName);
        sendMessage(name, generateErrorMsg(commonErrors.PEER_SOCKET_NOT_OPEN, peerName));
        return;
    }

    // Send Msg
    const outMessage: OutgoingMessagePeer = {
        type: 'peer-msg',
        peerName: name,
        payload: msg.payload,
    };
    sendMessage(peerName, outMessage);
}

function sendMessage(name: string, msg: OutgoingMessage): void {
    const peer = clientMap[name];
    peer.send(JSON.stringify(msg), (err) => {
        if (err) {
            logger.error(`${name}# Error occured while trying to send message. Err:`, err);
            if (peer.readyState !== ws.WebSocket.OPEN) {
                logger.error(`${name}# Socket does not seem open. Removing ... `);
                removeFromMap(name);
            }
        }
    });
}
