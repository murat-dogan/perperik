import * as ws from 'ws';

export interface SocketExtended extends ws {
    pkID: string;
    pkUniqueID: string;
}
