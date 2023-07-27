import { $IntentionalAny } from '@code-expert/type-utils';
import {
  applicative,
  array,
  monoid,
  nonEmptyArray,
  number,
  option,
  ord,
  pipeable,
  record,
  semigroup,
  separated,
  task,
  taskOption,
} from 'fp-ts';
// import { Alt } from 'fp-ts/Alt';
// import { Applicative } from 'fp-ts/Applicative';
// import { HKT } from 'fp-ts/HKT';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { Refinement } from 'fp-ts/Refinement';
import { flow, tuple } from 'fp-ts/function';

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
    option.getOrElseW(() => {
      throw new Error(`Array index ${i} out of bounds`);
    }),
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

export const unsafeFromReadonly = <A>(as: ReadonlyArray<A>) => as as Array<A>;

export const unfoldTaskK =
  <A, B>(b: B, f: (b: B) => taskOption.TaskOption<readonly [A, B]>): task.Task<Array<A>> =>
  async () => {
    const out: Array<A> = [];
    let bb: B = b;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const mt = await f(bb)();
      if (option.isSome(mt)) {
        const [a, b] = mt.value;
        out.push(a);
        bb = b;
      } else {
        break;
      }
    }

    return out;
  };

// // second attempt:
// export interface UnfoldE<U> {
//   <F>(F: Applicative<F>): <A, B>(
//     b: B,
//     f: (b: B) => HKT<F, option.Option<readonly [A, B]>>,
//   ) => HKT<F, HKT<U, B>>;
// }
//
// const UnfoldE: UnfoldE<array.URI> =
//   <F>(F: Applicative<F>) =>
//   <A, B>(b: B, f: (b: B) => HKT<F, option.Option<readonly [A, B]>>) => {
//   const out: HKT<F, Array<B>> = F.of([]);
//   let bb: HKT<F, B> = F.of(b);
//
//     array....
//   };

// // first attempt:
// const stopUnfold = Symbol();
// type StopUnfold = typeof stopUnfold;
// export const unfoldFromAlt =
//   <F extends URIS>(A: Alt<F> & Applicative<F>) =>
//   <A, B>(b: B, f: (b: B) => HKT<F, [A, B]>) => {
//     // const out: Array<A> = [];
//     // let bb: B = b;
//     //
//     // const accumulator = (aa: StopUnfold | readonly [A, B]) => {
//     //   if (aa === stopUnfold) {
//     //     stop = true;
//     //   } else {
//     //     const [a] = aa;
//     //     out.push(a);
//     //   }
//     //   return accumulator;
//     // };
//     //
//     // const recur = flow();
//     //
//     // return pipe(A.of(accumulator), (x) =>
//     //   A.ap(
//     //     x,
//     //     A.alt<StopUnfold | readonly [A, B]>(f(b), () => A.of(stopUnfold)),
//     //   ),
//     // );
//
//     const out: Array<A> = [];
//     let bb: B = b;
//
//     const fab1 = f(b);
//     const fabstop1 = A.alt(fab1, () => A.of<StopUnfold | [A, B]>(stopUnfold));
//     return A.ap(
//       A.of((abstop: StopUnfold | [A, B]) => {
//         if (abstop === stopUnfold) {
//           return [];
//         } else {
//           const [a1, b2] = abstop;
//           const fab2 = f(b2);
//           const fabstop2 = A.alt(fab2, () => A.of<StopUnfold | [A, B]>(stopUnfold));
//           return A.ap(
//             A.of((abstop: StopUnfold | [A, B]) => {
//               if (abstop === stopUnfold) {
//                 return [a1];
//               } else {
//                 const [a2, b3] = abstop;
//                 const fab3 = f(b3);
//                 const fabstop3 = A.alt(fab3, () => A.of<StopUnfold | [A, B]>(stopUnfold));
//                 return A.ap(/* etc. */);
//               }
//             }),
//             fabstop2,
//           );
//         }
//       }),
//       fabstop1,
//     );
//   };
