import * as array from 'fp-ts/Array';
import * as monoid from 'fp-ts/Monoid';
import * as option from 'fp-ts/Option';
import type { Ord } from 'fp-ts/Ord';
import { sign } from 'fp-ts/Ordering';
import { not } from 'fp-ts/Predicate';
import { flow, pipe } from 'fp-ts/function';
import * as string from 'fp-ts/string';

export * from 'fp-ts/string';

export const OrdLocale: Ord<string> = {
  equals: string.Eq.equals,
  compare: (first, second) => sign(first.localeCompare(second)),
};

/**
 * Check whether a given search term appears in a string using case-insensitive matching.
 */
export const looseIncludes =
  (searchString: string, position?: number) =>
  (s: string): boolean =>
    s.toLowerCase().includes(searchString.toLowerCase(), position);

// TODO consider replacing with https://gcanti.github.io/fp-ts-contrib/modules/RegExp.ts.html#match
export const match =
  (matcher: string | RegExp) =>
  (s: string): option.Option<RegExpMatchArray> =>
    option.fromNullable(s.match(matcher));

/**
 * Create a Monoid instance to join strings using a separator.
 */
export const join = (separator: string): monoid.Monoid<string> => ({
  concat: (a, b) => (a === '' || b === '' ? a + b : a + separator + b),
  empty: '',
});

/**
 * Monoid instance to join strings using a space.
 */
export const spaceSeparated: monoid.Monoid<string> = join(' ');

/**
 * Monoid instance to join strings using a semicolon.
 */
export const semicolonSeparated: monoid.Monoid<string> = join('; ');

/**
 * Check whether a string is whitespace or empty.
 * @see isNotBlank
 */
export const isBlank = flow(string.trim, string.isEmpty);

/**
 * Check whether a string contains non-whitespace characters.
 * @see isBlank
 */
export const isNotBlank = not(isBlank);

/**
 * A version of {@link startsWith} that works with multiple inputs
 */
export const startsWithOneOf =
  <A extends string>(...searchStrings: Array<A>) =>
  (s: string): boolean =>
    pipe(
      searchStrings,
      array.some((search) => s.startsWith(search)),
    );
