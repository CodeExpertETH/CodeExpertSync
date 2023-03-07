import { assert, describe, it } from 'vitest';

import { pipe } from '../prelude';
import { evolvePartial, renameKey } from './struct';

describe('prelude/struct', () => {
  describe('evolvePartial()', () => {
    it('should transform the values for the specified keys', () => {
      assert.deepEqual(pipe({ a: 1, b: 'B' }, evolvePartial({ a: (a) => a * 2 })), {
        a: 2,
        b: 'B',
      });
    });

    it('should ignore transforms for inexistent keys', () => {
      // @ts-expect-error should warn about unknown properties
      assert.deepEqual(pipe({ a: 1 }, evolvePartial({ b: (b) => b * 2 })), {
        a: 1,
      });
    });
  });

  describe('renameKey()', () => {
    it('should rename the key', () => {
      assert.deepEqual(pipe({ a: 1, c: 'C' }, renameKey('a', 'b')), {
        b: 1,
        c: 'C',
      });
    });

    it('should not rename inexistent keys', () => {
      // @ts-expect-error must not allow inexistent keys
      assert.deepEqual(pipe({ a: 1 }, renameKey('b', 'c')), { a: 1 });
    });
  });
});
