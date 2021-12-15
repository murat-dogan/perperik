import { customAlphabet } from 'nanoid';

const alphabet = 'abcdefghijklmnpqrstuvwxyz0123456789';

export default function generateClientName(): string {
    const nanoid = customAlphabet(alphabet, 8);
    return `${nanoid()}-${nanoid()}`;
}
