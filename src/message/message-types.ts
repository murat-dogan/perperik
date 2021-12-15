export interface Message2Server {
    type: string;
}

export interface Message2ServerPeer extends Message2Server {
    type: 'peer-msg';
    peerID: string;
    payload: unknown;
}

export interface Message2ServerQuery extends Message2Server {
    type: 'server-query';
    cmd: 'is-peer-online';
    peerID: string;
}

export interface Message2Client {
    type: string;
}

export interface Message2ClientWelcome extends Message2Client {
    type: 'welcome';
    id: string;
}

export interface Message2ClientError extends Message2Client {
    type: 'server-error';
    errMsg: string;
    info: string;
}

export interface Message2ClientPeer extends Message2Client {
    type: 'peer-msg';
    peerID: string;
    payload: unknown;
}
