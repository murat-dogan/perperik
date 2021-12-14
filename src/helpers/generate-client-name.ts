import { customAlphabet } from 'nanoid';

const alphabet = 'abcdefghijklmnpqrstuvwxyz0123456789';

export default function generateClientName(): string {
    const nanoid = customAlphabet(alphabet, 10);
    return `${nanoid()}-${nanoid()}`;
}
