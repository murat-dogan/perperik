import { OutgoingMessageError } from './message-types';

export function generateErrorMsg(errMsg: string, info: string): OutgoingMessageError {
    return {
        type: 'server-error',
        errMsg,
        info,
    };
}
