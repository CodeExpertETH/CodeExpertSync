import { describe, expect, it } from 'vitest';
import { digestMessage, pkceChallenge } from './crypto';
import { Uint8ArrayToBase64Url } from './base64url';
import { sha256 } from '@noble/hashes/sha256';

describe('crypto.ts', () => {
  describe('digestMessage', () => {
    it('should create a correct hash', () => {
      expect(digestMessage('abc')).toBe('Ophdp0_iJbIEXBcta9OQvYVfCG4-nVJbRr_iRRFDFTI');
      expect(digestMessage('blubbber dib blubb')).toBe(
        'L7Y9_5nHqh1u80676AYcVMNPR6q2LtrjptJcPjsl7MU',
      );
    });
  });

  describe('pkceChallenge', () => {
    it('code_challenge should be a hash of the code_verifier', () => {
      const { code_challenge, code_verifier } = pkceChallenge();
      expect(code_verifier).toHaveLength(86);
      expect(code_challenge).not.toBe(code_verifier);
      expect(Uint8ArrayToBase64Url.encode(sha256(code_verifier))).toBe(code_challenge);
    });
  });
});
