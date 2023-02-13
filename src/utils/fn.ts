import { nonEmptyArray } from '../prelude';

/**
 * Find items that are in the first array but not in the second
 */
export function difference<A>(xs: Array<A>, ys: Array<A>): Array<A> {
  return [xs, ys].reduce((a, b) => a.filter((c) => !b.includes(c)));
}

/**
 * Group items in an array using a keying function
 *
 * @deprecated use {@link nonEmptyArray.groupBy} instead
 */
export const groupBy = <A>(f: (a: A) => string, as: Array<A>) => nonEmptyArray.groupBy(f)(as);

/**
 * Determine if the given value is a JavaScript object (e.g. array, function, object, regex, etc.)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

/**
 * Keep only the given keys of an object
 */
export function pick<A extends Record<K, unknown>, K extends keyof A>(
  keys: Array<K>,
): (obj: A) => Pick<A, K>;
/**
 * Keep only the given keys of an object
 */
export function pick<A extends Record<K, unknown>, K extends keyof A>(
  obj: A,
  keys: Array<K>,
): Pick<A, K>;
/**
 * Keep only the given keys of an object
 */
export function pick<A extends Record<K, unknown>, K extends keyof A>(
  ...args: [A, Array<K>] | [Array<K>]
) {
  if (args.length === 1) return (a: A) => pick(a, args[0]);
  const [obj, keys] = args;
  if (keys.length === 0) return obj;
  const result = {} as Pick<A, K>;
  keys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) result[k] = obj[k];
  });
  return result;
}

/**
 * Remove the given keys from an object
 */
export function omit<A extends Record<K, unknown>, K extends keyof A>(
  keys: Array<K>,
): (obj: A) => Omit<A, K>;
/**
 * Remove the given keys from an object
 */
export function omit<A extends Record<K, unknown>, K extends keyof A>(
  obj: A,
  keys: Array<K>,
): Omit<A, K>;
/**
 * Remove the given keys from an object
 */
export function omit<A extends Record<K, unknown>, K extends keyof A>(
  ...args: [A, Array<K>] | [Array<K>]
) {
  if (args.length === 1) return (a: A) => omit(a, args[0]);
  const [obj, keys] = args;
  const pickedKeys = (Object.keys(obj) as Array<K>).filter((k) => !keys.includes(k));
  return pick(obj, pickedKeys) as $Unexpressable;
}

/**
 * Remove undefined values from an object
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function removeUndefined<A extends object>(obj: A): A {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== 'undefined'),
  ) as $Unexpressable;
}

/**
 * For the very specific use case of `obj != null && Object.keys(obj).length > 0`.
 * For convenience reasons, this currently also refines to NonNullable.
 */
export function isNonEmptyRecord<A extends Record<string, unknown>>(
  a: A | undefined | null,
): a is NonNullable<A> {
  // eslint-disable-next-line no-restricted-syntax
  if (a != null) for (const key in a) if (Object.prototype.hasOwnProperty.call(a, key)) return true;
  return false;
}

/**
 * Replacement for ['a', 'b'].includes(someVariable), but better typed.
 * Does not accept type `string` in as values ("haystack").
 */
export const isOneOf =
  <T extends string>(...values: Array<string extends T ? never : T>) =>
  <S>(value: [T] extends [S] ? S : never): value is [T] extends [S] ? T : never =>
    values.includes(value as $Unexpressable);
