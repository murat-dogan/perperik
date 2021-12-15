export interface IncomingMessage {
    type: string;
}

export interface IncomingMessage2Peer extends IncomingMessage {
    type: 'peer-msg';
    peerID: string;
    payload: unknown;
}

export interface OutgoingMessage {
    type: string;
}

export interface OutgoingMessageWelcome extends OutgoingMessage {
    type: 'welcome';
    id: string;
}

export interface OutgoingMessageError extends OutgoingMessage {
    type: 'server-error';
    errMsg: string;
    info: string;
}

export interface OutgoingMessagePeer extends OutgoingMessage {
    type: 'peer-msg';
    peerID: string;
    payload: unknown;
}
