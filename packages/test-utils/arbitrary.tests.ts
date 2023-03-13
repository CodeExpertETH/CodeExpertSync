import { string } from 'fp-ts';
import { assert, describe, it } from 'vitest';

import { arbitrary, fc, laws } from '.';

describe('Arbitrary', () => {
  describe('eq', () => {
    it('should correctly compare equal arbitraries', () => {
      assert.isTrue(arbitrary.getEq(string.Eq).equals(fc.string(), fc.string()));
    });
    it('should correctly compare non-equal arbitraries', () => {
      assert.isFalse(arbitrary.getEq(string.Eq).equals(fc.string(), fc.integer().map(String)));
    });
  });
  it('should fulfil Monad laws', () => laws.monad(arbitrary.Monad)(arbitrary.getEq));
});
