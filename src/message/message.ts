import { Message2ClientError } from './message-types';

export function generateErrorMsg(errMsg: string, info: string): Message2ClientError {
    return {
        type: 'pk-server-error',
        errMsg,
        info,
    };
}
