import * as ws from 'ws';
import { getLogger } from 'log4js';
import { IncomingMessage, IncomingMessage2Peer, OutgoingMessage, OutgoingMessagePeer } from '../message/message-types';
import commonErrors from '../error/common-errors';
import { generateErrorMsg } from '../message/message';
import { SocketExtended } from '../socket/socket';
import { consumeMessageSendLimit } from '../rate-limit/rate-limiter';

const logger = getLogger('client');

// TODO: This could be stored on redis in the future
const clientMap: { [index: string]: SocketExtended } = {};

export function add2Map(id: string, socket: SocketExtended): void {
    if (clientMap[id]) {
        // client with that id already exists
        logger.warn(`${id}# Seems already connected. Disconnecting old one...`);
        sendMessage(id, generateErrorMsg(commonErrors.NEW_CONN_WITH_SAME_ID, ''));
        removeFromMap(id);
    }

    logger.info(`${id}# New Connection`);

    clientMap[id] = socket;
    registerCallbacks(id, socket);
}

export function removeFromMap(id: string, uniqueID?: string): void {
    if (clientMap[id]) {
        // Check if this is correct id<-->uniqueID
        // If this is different, it will mean that this is another socket (like on re-connect)
        if (!uniqueID || clientMap[id].pkUniqueID == uniqueID) {
            if (clientMap[id].readyState == ws.WebSocket.OPEN) clientMap[id].terminate();
            delete clientMap[id];
        }
    }
}

function registerCallbacks(id: string, socket: SocketExtended): void {
    socket.on('close', (code) => {
        logger.info(`${id}# Socket closed (code: ${code}) ID: ${socket.pkUniqueID}`);
        removeFromMap(id, socket.pkUniqueID);
    });

    socket.on('error', (err) => {
        logger.error(`${id}# Socket error:`, err);
    });

    socket.on('message', (data) => {
        handleMsg(id, data);
    });
}

function handleMsg(id: string, data: ws.RawData): void {
    // Check Send Message Rate Limit
    consumeMessageSendLimit(id)
        .then(() => {
            try {
                const msg: IncomingMessage = JSON.parse(data.toString());
                if (!msg || !msg.type) {
                    logger.error(`${id}# Wrong message format. Received: ${JSON.stringify(data.toString() || {})}`);
                    return;
                }

                logger.debug(`${id}# Received: ${JSON.stringify(msg)}`);

                switch (msg.type) {
                    case 'peer-msg':
                        handlePeerMsg(id, msg as IncomingMessage2Peer);
                        break;

                    default:
                        logger.error(`${id}# Unknown message type. Received: ${JSON.stringify(data)}`);
                        return;
                }
            } catch (err) {
                logger.error(
                    `${id}# Error thrown while processing the received message. Received Data: ${JSON.stringify(
                        data.toString() || {},
                    )} Err:`,
                    err,
                );
            }
        })
        .catch(() => {
            // Rate Limit Exceeded
            logger.info(`${id}# Message Rate Limit Exceeded. Closing connection...`);
            sendMessage(id, generateErrorMsg(commonErrors.MESSAGE_RATE_LIMIT_EXCEEDED, id));
        });
}

function handlePeerMsg(id: string, msg: IncomingMessage2Peer): void {
    const peerID = msg.peerID;
    const peer = clientMap[peerID];

    // Check if peer is online
    if (!peer) {
        logger.error(`${id}# Trying to send peer-msg to ${peerID} but it does not seem online. `);
        sendMessage(id, generateErrorMsg(commonErrors.PEER_NOT_ONLINE, peerID));
        return;
    }

    // Check if socket is still open
    if (peer.readyState !== ws.WebSocket.OPEN) {
        logger.error(`${id}# Trying to send peer-msg to ${peerID} but socket does not seem open. Removing ... `);
        removeFromMap(peerID, peer.pkUniqueID);
        sendMessage(id, generateErrorMsg(commonErrors.PEER_SOCKET_NOT_OPEN, peerID));
        return;
    }

    // Send Msg
    const outMessage: OutgoingMessagePeer = {
        type: 'peer-msg',
        peerID: id,
        payload: msg.payload,
    };
    sendMessage(peerID, outMessage);
}

function sendMessage(id: string, msg: OutgoingMessage): void {
    const peer = clientMap[id];
    peer.send(JSON.stringify(msg), (err) => {
        if (err) {
            logger.error(`${id}# Error occured while trying to send message. Err:`, err);
            if (peer.readyState !== ws.WebSocket.OPEN) {
                logger.error(`${id}# Socket does not seem open. Removing ... `);
                removeFromMap(id, peer.pkUniqueID);
            }
        }
    });
}
