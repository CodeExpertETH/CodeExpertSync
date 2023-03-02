import { describe, expect, it } from 'vitest';
import { digestMessage } from './crypto';

describe('crypto.ts', () => {
  describe('digestMessage', () => {
    it('should create a correct hash', () => {
      expect(digestMessage('abc')).toBe('Ophdp0/iJbIEXBcta9OQvYVfCG4+nVJbRr/iRRFDFTI=');
      expect(digestMessage('blubbber dib blubb')).toBe(
        'L7Y9/5nHqh1u80676AYcVMNPR6q2LtrjptJcPjsl7MU=',
      );
    });
  });
});
