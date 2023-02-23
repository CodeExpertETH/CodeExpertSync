import { either } from 'fp-ts';
import { assert, describe, it } from 'vitest';

import { iots, tagged } from '../prelude';

describe('prelude/iots', () => {
  describe('tagged', () => {
    const StrSome = iots.tagged('some', iots.string);
    const StrNone = iots.tagged('none');
    const StrOption = iots.union([StrSome, StrNone]);
    type StrOption = iots.TypeOf<typeof StrOption>;
    const strOption = tagged.build<StrOption>();
    const some = strOption.some('foo');
    const none = strOption.none();

    it('should not alter valid values when encoding', () => {
      assert.deepStrictEqual(StrOption.encode(some), some);
      assert.deepStrictEqual(StrOption.encode(none), none);
    });

    describe('decode', () => {
      it('should not alter valid values', () => {
        assert.deepStrictEqual(StrOption.decode(some), either.right(some));
        assert.deepStrictEqual(StrOption.decode(none), either.right(none));
      });

      it('should strip additional properties', () => {
        assert.deepStrictEqual(
          StrOption.decode({ _tag: 'none', value: undefined }),
          either.right(none),
        );
        assert.deepStrictEqual(StrOption.decode({ _tag: 'none', value: null }), either.right(none));
        assert.deepStrictEqual(
          StrOption.decode({ _tag: 'none', value: 'bar' }),
          either.right(none),
        );
      });

      it('should reject invalid values', () => {
        assert.isTrue(either.isLeft(StrOption.decode({ _tag: 'some' })));
        assert.isTrue(either.isLeft(StrOption.decode({ _tag: 'bogus' })));
        assert.isTrue(either.isLeft(StrOption.decode({ _tag: 'bogus', value: 'foo' })));
      });
    });
  });
});
