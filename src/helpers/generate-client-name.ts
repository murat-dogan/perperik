import * as uuid from 'uuid';

export default function generateClientName(): string {
    return uuid.v4();
}
