import { sha256 } from '@noble/hashes/sha256';
import { describe, expect, it } from 'vitest';
import { Uint8ArrayToBase64Url } from './base64url';
import { pkceChallenge } from './crypto';

describe('crypto.ts', () => {
  describe('pkceChallenge', () => {
    it('code_challenge should be a hash of the code_verifier', () => {
      const { code_challenge, code_verifier } = pkceChallenge();
      expect(code_verifier).toHaveLength(86);
      expect(code_challenge).not.toBe(code_verifier);
      expect(Uint8ArrayToBase64Url.encode(sha256(code_verifier))).toBe(code_challenge);
    });
  });
});
