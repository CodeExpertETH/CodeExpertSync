import { expect, describe, it } from 'vitest';
import { dec2hex, digestMessage, generateRandomId } from './crypto';
import { either, pipe } from '../prelude';

describe('crypto.ts', () => {
  describe('dec2hex', () => {
    it('should convert a number to hex representation', () => {
      expect(dec2hex(0)).toStrictEqual(either.right('00'));
      expect(dec2hex(10)).toStrictEqual(either.right('0a'));
      expect(dec2hex(255)).toStrictEqual(either.right('ff'));
    });
    it('should return RangeError if not in uint8 bounds', () => {
      expect(pipe(dec2hex(256), either.isLeft)).toBe(true);
      expect(pipe(dec2hex(-2), either.isLeft)).toBe(true);
    });
  });
  describe('generateRandomId', () => {
    it('should create a random id with a certain length', () => {
      expect(generateRandomId(10)).toHaveLength(10);
      expect(generateRandomId(20)).toHaveLength(20);
      expect(generateRandomId(40)).toHaveLength(40);
    });
  });

  describe('digestMessage', () => {
    it('should create a correct hash', () => {
      expect(digestMessage('abc')).toBe(
        '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532',
      );
      expect(digestMessage('blubbber dib blubb')).toBe(
        '2fb63dff99c7aa1d6ef34ebbe8061c54c34f47aab62edae3a6d25c3e3b25ecc5',
      );
    });
  });
});
