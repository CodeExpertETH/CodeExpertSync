import { sha256 } from '@noble/hashes/sha256';
import { describe, expect, it } from 'vitest';
import { Uint8ArrayToBase64Url } from './base64url';
import { pkceChallenge } from './crypto';

describe('crypto.ts', () => {
  describe('pkceChallenge', () => {
    it('code challenge should be a hash of the code verifier', () => {
      const { codeChallenge, codeVerifier } = pkceChallenge();
      expect(codeVerifier).toHaveLength(86);
      expect(codeChallenge).not.toBe(codeVerifier);
      expect(Uint8ArrayToBase64Url.encode(sha256(codeVerifier))).toBe(codeChallenge);
    });
  });
});
