import {FunctionN, identity, pipe} from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as NEA from 'fp-ts/NonEmptyArray';
import * as eq from 'fp-ts/Eq';
import * as predicate from 'fp-ts/Predicate';

export * from 'fp-ts/NonEmptyArray';

export const every =
  <A>(predicate: predicate.Predicate<A>) =>
  (as: NonEmptyArray<A>): boolean =>
    pipe(as, A.every(predicate));

export const { some } = A;

export function sum(as: NonEmptyArray<number>): number;
export function sum<A>(as: NonEmptyArray<A>, acc: FunctionN<[A], number>): number;
export function sum<A>(as: NonEmptyArray<A | number>, acc_?: FunctionN<[A], number>): number {
  const acc: FunctionN<[$Unexpressable], number> = acc_ != null ? acc_ : identity;
  return pipe(
    as,
    NEA.reduce<A | number, number>(0, (accumulator, a) => accumulator + acc(a)),
  );
}

/**
 * Group a non-empty array by a key.
 * @param equal the eq typeclass instance for the key
 * @param k the function to derive the key
 * @param f the function to combine the sub-array and the key to build group elements
 */
export const groupByKey =
  <A, K, B>(equal: eq.Eq<K>, k: FunctionN<[A], K>, f: FunctionN<[NonEmptyArray<A>, K], B>) =>
  (as: NonEmptyArray<A>): NonEmptyArray<B> =>
    pipe(
      as,
      NEA.group(pipe(equal, eq.contramap(k))),
      NEA.map((a) => f(a, k(NEA.head(a)))),
    );

// /**
//  * {@link NEA.groupSort} was deprecated, this is our own implementation of this useful combinator
//  */
// export const groupSort: <A>(
//   ord: ord.Ord<A>,
// ) => (as: NonEmptyArray<A>) => NonEmptyArray<NonEmptyArray<A>> = (ord) => (as) =>
//   NEA.group(ord)(NEA.sort(ord)(as));
//
// /**
//  * {@link NEA.filter} was deprecated, this is our own implementation of this useful combinator.
//  */
// export const filter: {
//   <A, B extends A>(r: refinement.Refinement<A, B>): (
//     as: NonEmptyArray<A>,
//   ) => option.Option<NonEmptyArray<B>>;
//   <A>(p: predicate.Predicate<A>): (as: NonEmptyArray<A>) => option.Option<NonEmptyArray<A>>;
// } = <A, B extends A>(p: predicate.Predicate<A> | refinement.Refinement<A, B>) =>
//   flow(A.filter(p), NEA.fromArray);
