import fc, { Arbitrary, IRawProperty, Parameters } from 'fast-check';
import { nonEmptyArray as NEA, option, these } from 'fp-ts';

export * from 'fast-check';

export const constFalse = fc.constant<false>(false);
export const constTrue = fc.constant<true>(true);
export const constUndefined = fc.constant(undefined);

/**
 * Sample a single item.
 */
export const sampleOne = <A>(
  generator: IRawProperty<A> | Arbitrary<A>,
  params?: Omit<Parameters<A>, 'numRuns'>,
): A => fc.sample(generator, { seed: 0, ...params, numRuns: 1 })[0];

/**
 * Human readable email addresses (as opposed to {@link fc.emailAddress} which is for spec testing)
 */
export const humanEmailAddress = (): fc.Arbitrary<string> =>
  fc
    .lorem({ maxCount: 3 })
    .chain((nameWords) =>
      fc
        .lorem({ maxCount: 2 })
        .chain((domainWords) =>
          fc.constant(
            `${nameWords.replace(/\s+/, '-')}@${domainWords.replace(/\s+/, '.')}.example.com`,
          ),
        ),
    );

export const optional = <A>(arb: fc.Arbitrary<A>): fc.Arbitrary<A | undefined> =>
  fc.option(arb, { nil: undefined });

export const optionArb = <A>(arb: fc.Arbitrary<A>): fc.Arbitrary<option.Option<A>> =>
  fc.tuple(fc.boolean(), arb).map(([isSome, x]) => (isSome ? option.some(x) : option.none));

export const theseArb = <E, A>(
  eArb: fc.Arbitrary<E>,
  aArb: fc.Arbitrary<A>,
): fc.Arbitrary<these.These<E, A>> =>
  fc.constantFrom<0 | 1 | 2>(0, 1, 2).chain((choice) => {
    if (choice === 2) return fc.tuple(eArb, aArb).map(([e, a]) => these.both(e, a));
    if (choice === 1) return eArb.map(these.left);
    return aArb.map(these.right);
  });

/**
 * A date in a realistic, present-day range that works for our domain.
 * - Use in places where a user would input a date.
 * - Don't use for testing e.g. date arithmetic, where we want fast-check's full date range.
 */
export const dateCurrent = ({
  min = new Date(2018, 0, 1),
  max = new Date(2028, 0, 1),
}: { min?: Date; max?: Date } = {}): Arbitrary<Date> =>
  fc.date({ min: min < max ? min : max, max: max > min ? max : min });

export const dateRange = (options?: { min?: Date; max?: Date }) =>
  fc
    .tuple(fc.date(options), fc.date(options))
    .map(([a, b]) => (a.getTime() > b.getTime() ? [b, a] : [a, b]));

const DATE_MAX = new Date(8640000000000000);
const DATE_MIN = new Date(-8640000000000000);
export const dateRangeStrict = ({ min, max }: { min?: Date; max?: Date } = {}): fc.Arbitrary<
  [Date, Date]
> => {
  if (min != null && min.getTime() === DATE_MAX.getTime())
    throw new TypeError(`dateRangeStrict min can not be DATE_MAX (${DATE_MAX.toISOString()})`);
  if (max != null && max.getTime() === DATE_MIN.getTime())
    throw new TypeError(`dateRangeStrict min can not be DATE_MAX (${DATE_MAX.toISOString()})`);
  if (min != null && max != null && min.getTime() === max.getTime())
    throw new TypeError('dateRangeStrict max must be greater than min');

  return fc.tuple(fc.date({ min, max }), fc.date({ min, max })).map(([a, b]): [Date, Date] => {
    if (a.getTime() === b.getTime()) {
      // if we're touching the upper bound, we need to subtract
      if (max != null && a.getTime() === max.getTime()) return [new Date(a.getTime() - 1), a];

      // in all other cases, we can increase
      return [a, new Date(a.getTime() + 1)];
    }
    return a.getTime() < b.getTime() ? [a, b] : [b, a];
  });
};

export const nonEmptyArray = <T>(
  arb: fc.Arbitrary<T>,
  { minLength = 1, maxLength }: fc.ArrayConstraints = {},
) => {
  if (minLength < 1) throw new TypeError('nonEmptyArray minLength must be greater than 0');
  return fc.array(arb, { minLength, maxLength }) as fc.Arbitrary<NEA.NonEmptyArray<T>>;
};
