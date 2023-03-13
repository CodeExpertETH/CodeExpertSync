import { Brand } from '@code-expert/type-utils';
import { eq, option, ord } from 'fp-ts';
import { constant, flow, pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import * as iots from 'io-ts';

export * from 'fp-ts/number';

/**
 * Compare two `Number`s and return `true` if they are equal up to the given (absolute) precision.
 * Note that this is not scale invariant, i.e. an Eq derived using this function will not behave
 * the same way for large numbers as it does for tiny numbers.
 *
 * We intentionally don't provide a scale invariant version of getEq, because in our context it's
 * important to define specific Eqs for specific situations. We compare results with a relatively
 * low precision, for example.
 */
export const getEqAbsolute: (tolerance: number) => eq.Eq<number> = (tolerance) =>
  eq.fromEquals((a, b) => Math.abs(a - b) <= tolerance);

/**
 * Clamp a number to the given bounds.
 *
 * @example
 * clamp(1, 3)(5) // => 3
 */
export const clamp = ord.clamp(N.Ord);

/**
 * Asserts that a value is a number we can work with, i.e. it is not nullable, Infinity, or NaN.
 *
 * TypeScript can't add a type guard for this, because `typeof NaN === 'number'`. But we take the
 * liberty to add one anyways, because it is useful in our context.
 */
export const isFinite = (x: unknown): x is number => Number.isFinite(x);

/**
 * Remove trailing zeroes from a numeric string.
 *
 * Working on a string is more robust than other solutions like `parseFloat` that have many
 * edge cases.
 *
 * @example
 * stripTrailingZeroes("0.0000") // => "0"
 * stripTrailingZeroes("0.0300") // => "0.03"
 */
export const stripTrailingZeroes = (x: string) => x.replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');

/**
 * A data last version of {@link Number.toFixed}. Clamps the digits to appear after the decimal
 * point to the required [0, 20] range.
 */
export const toFixed = flow(
  clamp(0, 20),
  (fractionDigits) => (x: number) => x.toFixed(fractionDigits),
);

/**
 * Format a number to have up to `fractionDigits` digits after the decimal point, but remove
 * trailing zeroes.
 */
export const toFixedZ = (fractionDigits: number) =>
  flow(toFixed(fractionDigits), stripTrailingZeroes);

// -------------------------------------------------------------------------------------------------
// Unit Interval

/**
 * A number that is assured to be within the [0, 1] bounds of
 * the [unit interval](https://en.wikipedia.org/wiki/Unit_interval).
 */
export interface UnitIntervalBrand {
  readonly UnitInterval: unique symbol;
}

export type UnitInterval = iots.Branded<number, UnitIntervalBrand>;

export const unitInterval = iots.brand(
  iots.number,
  (n): n is UnitInterval => ord.between(N.Ord)(0, 1)(n),
  'UnitInterval',
);

/**
 * Force a number to be within the unit interval [0, 1].
 */
export const clampUnitInterval = (x: number): UnitInterval => clamp(0, 1)(x) as UnitInterval;

/**
 * Map a number from the domain [min, max] to a number in the unit interval [0, 1]. Numbers
 * outside the range are {@link clamp}ed to the domain's boundaries.
 *
 * @throws {TypeError} if min, max, or num is NaN
 */
export const unitIntervalFromRange = (min: number, max: number) => {
  if (Number.isNaN(min)) throw new TypeError('min is NaN');
  if (Number.isNaN(max)) throw new TypeError('max is NaN');
  return (num: number): UnitInterval => {
    if (Number.isNaN(num)) throw new TypeError('num is NaN');

    if (min === max) return 0 as UnitInterval;
    return pipe(
      num,
      min < max ? clamp(min, max) : clamp(max, min),
      (x) => (x - min) / (max - min),
      Math.abs,
      clampUnitInterval,
    );
  };
};

/**
 * Map a number from the unit interval to a number in the codomain [min, max]. Numbers outside
 * the unit interval are clamped to [0, 1].
 */
export const unitIntervalToRange = (min: number, max: number) =>
  flow(clampUnitInterval, (x) => {
    const range = max - min;
    return min + x * range;
  });

/**
 * Safely create a {@link UnitInterval} from a numerator and denominator. Clamps to [0, 1] should
 * the numerator be greater than the denominator.
 */
export const unitIntervalFromParts = (
  numerator: number,
  denominator: number,
): option.Option<UnitInterval> =>
  pipe(numerator / denominator, option.fromPredicate(isFinite), option.map(clampUnitInterval));

/**
 * Variant of {@link unitIntervalFromParts} that returns a fallback value should the resulting
 * value not be finite.
 */
export const unitIntervalFromPartsOrElse = (orElse: 0 | 1) =>
  flow(unitIntervalFromParts, option.getOrElse(constant(clampUnitInterval(orElse))));

// -------------------------------------------------------------------------------------------------
// Percent

/**
 * A number that is typically in the range of [0, 100], but doesn't have to be.
 */
export type Percent = Brand<number, 'Percent'>;

/**
 * Create a {@link Percent} value out of a {@link UnitInterval}.
 */
export const percentFromUnitInterval = (x: number): Percent => (x * 100) as Percent;

/**
 * Safely create a {@link Percent} from a numerator and denominator. Clamps to [0, 100] should
 * the numerator be greater than the denominator.
 */
export const percentFromParts = flow(unitIntervalFromParts, option.map(percentFromUnitInterval));

/**
 * Variant of {@link percentFromParts} that returns a fallback value should the resulting
 * value not be finite.
 */
export const percentFromPartsOrElse = (orElse: 0 | 100) =>
  flow(percentFromParts, option.getOrElse(constant(orElse as Percent)));

/**
 * Use this function in places where you are certain that the denominator is non-zero.
 *
 * @throws {TypeError} If the denominator is zero.
 */
export const unsafePercentFromParts = flow(
  percentFromParts,
  option.getOrElse<Percent>(() => {
    throw new TypeError('Division by zero.');
  }),
);
