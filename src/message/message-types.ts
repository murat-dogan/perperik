// Message2Server
export interface Message2Server {
    type: string;
}

export interface Message2ServerPeer extends Message2Server {
    type: string;
    id: string;
    // Client can add other properties
}

export interface Message2ServerQuery extends Message2Server {
    type: 'pk-server-query';
    query: 'is-peer-online';
    queryRef?: string; // Optional query reference
    id: string;
}

// Message2Client
export interface Message2Client {
    type: string;
}

export interface Message2ClientWelcome extends Message2Client {
    type: 'pk-welcome';
    id: string;
}

export interface Message2ClientError extends Message2Client {
    type: 'pk-server-error';
    errMsg: string;
    info: string;
}

export interface Message2ClientPeer extends Message2Client {
    type: string;
    id: string;
    // Client can add other properties
}

export interface Message2ClientQuery extends Message2Client {
    type: 'pk-server-query';
    query: 'is-peer-online';
    queryRef?: string; // Optional query reference
    id: string;
    result: boolean;
}
