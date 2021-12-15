// Message2Server
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
    query: 'is-peer-online';
    queryRef?: string; // Optional query reference
    peerID: string;
}

// Message2Client
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

export interface Message2ClientQuery extends Message2Client {
    type: 'server-query';
    query: 'is-peer-online';
    queryRef?: string; // Optional query reference
    peerID: string;
    result: boolean;
}
