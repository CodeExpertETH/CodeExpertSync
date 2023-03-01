import { SHA3 } from 'sha3';
import { Base64, Uint8ArrayToBase64 } from './base64';

/**
 * creates a random number with a certain length
 * @param len
 */
export function generateRandomId(len: number): Base64 {
  const arr = new Uint8Array(len / 2);
  const a2 = window.crypto.getRandomValues(arr);
  return Uint8ArrayToBase64.encode(a2);
}

/**
 * calculates the sha3-256 hash of the message
 * @param message
 */
export function digestMessage(message: string): Base64 {
  const hash = new SHA3(256);
  return hash.update(message).digest('base64') as Base64;
}
