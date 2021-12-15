export interface IncomingMessage {
    type: string;
}

export interface IncomingMessage2Peer extends IncomingMessage {
    type: 'peer-msg';
    peerName: string;
    payload: unknown;
}

export interface OutgoingMessage {
    type: string;
}

export interface OutgoingMessageWelcome extends OutgoingMessage {
    type: 'welcome';
    name: string;
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
