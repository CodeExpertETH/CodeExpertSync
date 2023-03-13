import { fc } from '@code-expert/test-utils';
import { array, option, string } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { assert, describe, it } from 'vitest';

import * as ord from './ord';

export const optional = <A>(arb: fc.Arbitrary<A>): fc.Arbitrary<A | undefined> =>
  fc.option(arb, { nil: undefined });
describe('ord', () => {
  describe('getNullable', () => {
    it('should be equivalent to option.getOrd', () => {
      type T = string | null | undefined;
      const ordNullableString: ord.Ord<T> = ord.getNullable(string.Ord);
      const ordOptionalString: ord.Ord<T> = pipe(
        option.getOrd(string.Ord),
        ord.contramap(option.fromNullable),
      );
      const prop = (as: Array<T>) =>
        assert.deepEqual(
          pipe(as, array.sort(ordNullableString)),
          pipe(as, array.sort(ordOptionalString)),
        );

      fc.assert(fc.property(fc.array(optional(fc.string())), prop));
    });
  });
});
