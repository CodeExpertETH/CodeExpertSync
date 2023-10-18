import { sha256 } from '@noble/hashes/sha256';
import { Base64Url, Uint8ArrayToBase64Url } from './base64url';

/**
 * creates a random number with a certain length
 * @param len
 */
export function generateRandomId(len: number): Base64Url {
  const arr = new Uint8Array(len / 2);
  const a2 = crypto.getRandomValues(arr);
  return Uint8ArrayToBase64Url.encode(a2);
}

export function pkceChallenge() {
  const codeVerifier = generateRandomId(128);
  const codeChallenge = Uint8ArrayToBase64Url.encode(sha256(codeVerifier));

  return {
    codeChallenge,
    codeVerifier,
  };
}
