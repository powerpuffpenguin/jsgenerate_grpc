import { v1 as uuidv1 } from 'uuid';
import * as md5 from 'crypto-js/md5';
export function getUnix(): number {
    const dateTime = Date.now()
    return Math.floor(dateTime / 1000)
}
export function getUUID(): string {
    return uuidv1()
}
export function md5String(message: string): string {
    return md5(message).toString()
}