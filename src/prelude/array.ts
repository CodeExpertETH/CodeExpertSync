import {
  applicative,
  array,
  monoid,
  nonEmptyArray,
  number,
  ord,
  pipeable,
  record,
  semigroup,
  separated,
} from 'fp-ts';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { Refinement } from 'fp-ts/Refinement';
import { flow, tuple } from 'fp-ts/function';

import * as option from './option';

export * from 'fp-ts/Array';

export const neighbors =
  <A>(middle: A): ((as: A[]) => [option.Option<A>, option.Option<A>]) =>
  (as) => {
    const i = as.indexOf(middle);
    return i === -1
      ? [option.none, option.none]
      : [option.fromNullable(as[i - 1]), option.fromNullable(as[i + 1])];
  };

/**
 * Remove duplicates from an array, keeping the first occurrence of an element. Sorts the returned
 * unique elements in order.
 */
export const uniqSort = <A>(o: ord.Ord<A>) => flow(array.uniq(o), array.sort(o));

/**
 * "Reverses" the index of an Array, from `{ [number]: A }` to `{ [string]: number }`, number here
 * being the index in the given Array.
 *
 * To build the index, a function f `(a: A) => string` must be given. To emulate the behaviour of
 * array.findIndex, elements that produce a key that is already present in the reverse index are
 * ignored. If collisions are possible or duplicate (under f) are present, f should also be used to
 * calculate the key to look up the index.
 *
 * @example
 * assert.deepEqual(
 *   {
 *     a: 0,
 *     b: 1,
 *     c: 3,
 *   },
 *   pipe(
 *     [{_id: 'a'}, {_id: 'b'}, {_id: 'a'}, {_id: 'c'}],
 *     reverseIndexFirst((x) => x._id),
 *   )
 * )
 */
export const reverseIndexFirst: <A, K extends string>(
  f: (a: A) => K,
) => (as: Array<A>) => Record<K, number> = (f) => {
  const fromArrayMap = record.fromFoldableMap(semigroup.first<number>(), array.Foldable);
  return flow(array.mapWithIndex(tuple), (as) => fromArrayMap(as, ([i, a]) => [f(a), i]));
};

/**
 * Traverse followed by flatten.
 */
export function flatTraverse<F extends URIS2>(
  F: applicative.Applicative2<F>,
): <E, A, B>(f: (_: A) => Kind2<F, E, Array<B>>) => (a: Array<A>) => Kind2<F, E, Array<B>>;
export function flatTraverse<F extends URIS>(
  F: applicative.Applicative1<F>,
): <A, B>(f: (_: A) => Kind<F, Array<B>>) => (a: Array<A>) => Kind<F, Array<B>> {
  return (f) => flow(array.traverse(F)(f), pipeable.pipeable(F).map(array.flatten));
}

export const lookupOrThrow = (i: number) =>
  flow(
    array.lookup(i),
    option.getOrThrow(() => new Error(`Array index ${i} out of bounds`)),
  );

/**
 * Returns true iff the array contains exactly one element.
 * Asserts that the array is non-empty.
 */
export const isSingleton = <A>(a: Array<A>): a is NonEmptyArray<A> => a.length === 1;

export const sum = monoid.concatAll(number.MonoidSum);

/**
 * Similar to array.partition, but can shrink both the left and right hand type
 * if the input type is not infinite.
 */
export const partitionUnion: <A extends string, B extends A>(
  r: Refinement<A, B>,
) => (as: Array<A>) => separated.Separated<Array<Exclude<A, B>>, Array<B>> =
  array.partition as $IntentionalAny;

export const min = <A>(o: ord.Ord<A>): ((a: Array<A>) => option.Option<A>) =>
  flow(nonEmptyArray.fromArray, option.map(nonEmptyArray.min(o)));
