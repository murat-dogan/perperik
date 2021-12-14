export interface IncomingMessage {
    type: string;
}

export interface IncomingMessage2Peer extends IncomingMessage {
    type: 'peer-msg';
    peerName: string;
    payload: unknown;
}

export interface IncomingMessage2Server extends IncomingMessage {
    type: 'server-msg';
    payload: unknown;
}

export interface OutgoingMessage {
    type: string;
}

export interface OutgoingMessageWelcome extends OutgoingMessage {
    type: 'welcome';
    clientName: string;
}

export interface OutgoingMessageError extends OutgoingMessage {
    type: 'server-error';
    errMsg: string;
    info: string;
}

export interface OutgoingMessagePeer extends OutgoingMessage {
    type: 'peer-msg';
    peerName: string;
    payload: unknown;
}

export function generateErrorMsg(errMsg: string, info: string): OutgoingMessageError {
    return {
        type: 'server-error',
        errMsg,
        info,
    };
}

export const commonErrors = {
    PEER_NOT_ONLINE: 'PEER_NOT_ONLINE',
    PEER_SOCKET_NOT_OPEN: 'PEER_SOCKET_NOT_OPEN',
};
