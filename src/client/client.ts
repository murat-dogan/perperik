import * as ws from 'ws';
import { getLogger } from 'log4js';
import { IncomingMessage, IncomingMessage2Peer, OutgoingMessage, OutgoingMessagePeer } from '../message/message-types';
import commonErrors from '../error/common-errors';
import { generateErrorMsg } from '../message/message';
import { SocketExtended } from '../socket/socket';

const logger = getLogger('client');

// TODO: This could be stored on redis in the future
const clientMap: { [index: string]: SocketExtended } = {};

export function add2Map(name: string, socket: SocketExtended): void {
    if (clientMap[name]) {
        // client with that name already exists
        logger.warn(`${name}# Seems already connected. Disconnecting old one...`);
        sendMessage(name, generateErrorMsg(commonErrors.NEW_CONN_WITH_SAME_NAME, ''));
        removeFromMap(name);
    }

    logger.info(`${name}# New Connection`);

    clientMap[name] = socket;
    registerCallbacks(name, socket);
}

export function removeFromMap(name: string): void {
    if (clientMap[name] && clientMap[name].readyState == ws.WebSocket.OPEN) clientMap[name].terminate();
    delete clientMap[name];
}

function registerCallbacks(name: string, socket: SocketExtended): void {
    socket.on('close', (code) => {
        logger.info(`${name}# Socket closed (code: ${code}) ID: ${socket.pkUniqueID}`);

        // Check if this is correct name<-->uniqueID
        // If this is different, it will mean that this is another socket (like on re-connect)
        if (clientMap[name].pkUniqueID == socket.pkUniqueID) removeFromMap(name);
    });

    socket.on('error', (err) => {
        logger.error(`${name}# Socket error:`, err);
    });

    socket.on('message', (data) => {
        try {
            const msg: IncomingMessage = JSON.parse(data.toString());
            if (!msg || !msg.type) {
                logger.error(`${name}# Wrong message format. Received: ${JSON.stringify(data.toString() || {})}`);
                return;
            }

            logger.debug(`${name}# Received: ${JSON.stringify(msg)}`);

            switch (msg.type) {
                case 'peer-msg':
                    handlePeerMsg(name, msg as IncomingMessage2Peer);
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
