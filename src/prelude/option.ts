import { flow, Lazy, pipe } from 'fp-ts/function';
import * as alternative from './alternative';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { applicative, apply, option, pipeable } from 'fp-ts';

export * from 'fp-ts/Option';

export const sequenceS = apply.sequenceS(option.Apply);

export const when = <A>(condition: boolean, a: Lazy<A>): option.Option<A> =>
  condition ? option.of(a()) : option.none;

/**
 * Create an optional value depending on whether a condition is fulfilled.
 */
export const fromBoolean =
  <A>(onTrue: Lazy<A>) =>
  (condition: boolean): option.Option<A> =>
    condition ? option.some(onTrue()) : option.none;

/**
 * Takes a list of functions (a: A) => Option<B> and returns a function (a: A) => Option<B>, which
 * tries the given functions in order, returning the result of the first one to return Some, or None
 * if all return None.
 *
 * @example
 * assert.deepEqual(
 *   option.some(5),
 *   pipe(
 *     [1, 3, 5, 7, 9],
 *     option.altAllBy(
 *       array.findFirst((x) => x % 2 === 0),
 *       array.findFirst((x) => x >= 10),
 *       array.findFirst((x) => x >= 4),
 *     ),
 *   ),
 * );
 */
export const altAllBy = alternative.altAllBy(option.Alternative);

export const getOrThrow =
  (error: Lazy<Error>) =>
  <A>(o: option.Option<A>): A =>
    pipe(
      o,
      option.getOrElse<A>(() => {
        throw error();
      }),
    );

/**
 * Traverse followed by flatten.
 */
export function flatTraverse<F extends URIS2>(
  F: applicative.Applicative2<F>,
): <E, A, B>(
  f: (_: A) => Kind2<F, E, option.Option<B>>,
) => (a: option.Option<A>) => Kind2<F, E, option.Option<B>>;
export function flatTraverse<F extends URIS>(
  F: applicative.Applicative1<F>,
): <A, B>(
  f: (_: A) => Kind<F, option.Option<B>>,
) => (a: option.Option<A>) => Kind<F, option.Option<B>> {
  return (f) => flow(option.traverse(F)(f), pipeable.pipeable(F).map(option.flatten));
}
