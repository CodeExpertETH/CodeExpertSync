import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { describe, it } from 'vitest';

import * as fc from './fast-check';

describe('fast-check extensions', () => {
  it('dateRangeStrict', () => {
    const prop = ([a, b]: [Date, Date]) => b.getTime() > a.getTime();

    const reasonableDateArb = fc.dateCurrent({
      min: new Date(0),
      max: new Date('2069-12-31 23:59:59.999Z'),
    });

    const maybeTwoDates: fc.Arbitrary<[Date | undefined, Date | undefined]> = fc
      .tuple(fc.optional(reasonableDateArb), fc.optional(reasonableDateArb), fc.integer({ min: 1 }))
      .map(([a, b, offset]) => {
        if (a != null && b != null) {
          // prevent min === max
          if (a.getTime() === b.getTime()) return [a, new Date(a.getTime() + offset)];
          // prevent min > max
          return a.getTime() < b.getTime() ? [a, b] : [b, a];
        }
        return [a, b];
      });

    fc.assert(
      fc.property(
        maybeTwoDates.chain(([min, max]) =>
          fc.dateRangeStrict({ min, max }).map(([a, b]) => [a, b, min, max] as const),
        ),
        ([a, b]) => prop([a, b]),
      ),
    );
  });

  it('nonEmptyArray', () => {
    const prop = (a: NonEmptyArray<unknown>) => a.length > 0;

    const elements = fc
      .tuple(
        fc.optional(fc.integer({ min: 1, max: 100 })),
        fc.optional(fc.integer({ min: 1, max: 100 })),
      )
      .map(([a, b]) => {
        if (a != null && b != null) return a < b ? [a, b] : [b, a];
        return [a, b];
      });

    fc.assert(
      fc.property(
        elements.chain(([minLength, maxLength]) =>
          fc.oneof(
            fc.nonEmptyArray(fc.constant(null), { minLength, maxLength }),
            fc.nonEmptyArray(fc.constant(null)),
          ),
        ),
        prop,
      ),
    );
  });
});
