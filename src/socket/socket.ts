import * as ws from 'ws';

export interface SocketExtended extends ws {
    pkName: string;
    pkUniqueID: string;
}
