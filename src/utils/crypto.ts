import { either, identity, monoid, pipe, string } from '../prelude';
import { SHA3 } from 'sha3';
/**
 * Convert a uint8 number to hex string
 * @param dec
 */
export function dec2hex(dec: number): either.Either<RangeError, string> {
  if (!Number.isInteger(dec) || dec < 0 || dec > 255)
    return either.left(RangeError('Number is out of Uint8 range'));
  return either.right(dec.toString(16).padStart(2, '0'));
}

export function arrayToHexString(arr: Uint8Array): string {
  return pipe(
    Array.from(arr, dec2hex),
    either.sequenceArray,
    either.getOrThrow(identity),
    monoid.concatAll(string.Monoid),
  );
}

/**
 * creates a random number with a certain length
 * @param len
 */
export function generateRandomId(len: number): string {
  const arr = new Uint8Array(len / 2);
  const a2 = window.crypto.getRandomValues(arr);

  return arrayToHexString(a2);
}

export function digestMessage(message: string) {
  const hash = new SHA3(256);

  return hash.update(message).digest('hex');
}
