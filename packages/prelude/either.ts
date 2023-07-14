import { $Unexpressable } from '@code-expert/type-utils';
import * as apply from 'fp-ts/Apply';
import * as either from 'fp-ts/Either';
import { NonEmptyArray, getSemigroup } from 'fp-ts/NonEmptyArray';
import * as predicate from 'fp-ts/Predicate';
import * as refinement from 'fp-ts/Refinement';
import { Lazy, constUndefined, flow, identity, pipe } from 'fp-ts/function';

// eslint-disable-next-line import/export
export * from 'fp-ts/Either';

export const sequenceS = apply.sequenceS(either.Applicative);

/**
 * A variant of {@link stopIf} that allows the left part of the Either to be widened.
 */
export const stopIfW: {
  <A, B extends A, E2>(refinement: refinement.Refinement<A, B>, onTrue: (a: A) => E2): <E1>(
    ma: either.Either<E1, A>,
  ) => either.Either<E1 | E2, B>;
  <A, E2>(p: predicate.Predicate<A>, onTrue: (a: A) => E2): <E1>(
    ma: either.Either<E1, A>,
  ) => either.Either<E1 | E2, A>;
} = <A, E2>(
  p: predicate.Predicate<A>,
  onTrue: (a: A) => E2,
): (<E1>(ma: either.Either<E1, A>) => either.Either<E1 | E2, A>) =>
  either.filterOrElseW(predicate.not(p), onTrue);

/**
 * This is the negation of {@link filterOrElse}. If the predicate returns `true`, a `Left` is
 * returned, using the `onTrue` value. Otherwise, the `Right` is passed through.
 *
 * @see stopIfW
 */
export const stopIf: {
  <E, A, B extends A>(refinement: refinement.Refinement<A, B>, onTrue: (a: B) => E): (
    ma: either.Either<E, A>,
  ) => either.Either<E, A>;
  <E, A>(p: predicate.Predicate<A>, onTrue: (a: A) => E): (
    ma: either.Either<E, A>,
  ) => either.Either<E, A>;
} = stopIfW;

// -----------------------------------------------------------------------------------------------
// Validation

/**
 * Lift an Either-returning function into a validation context, so we can accumulate
 * data on the left side.
 */
export const liftValidation =
  <L, A>(check: (x: A) => either.Either<L, A>): ((x: A) => either.Either<NonEmptyArray<L>, A>) =>
  (x) =>
    pipe(
      check(x),
      either.mapLeft((y) => [y]),
    );

/**
 * Turn a list of Eithers into an Either with the errors aggregated into a
 * non-empty array.
 *
 * @see https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja
 */
export const getValidationSequenceT = <A>() =>
  apply.sequenceT(either.getValidation(getSemigroup<A>()));

export const existsLeft = <E>(
  p: predicate.Predicate<E>,
): (<A>(e: either.Either<E, A>) => boolean) => flow(either.swap, either.exists(p));

export const fromBoolean =
  <E, A>(onFalse: Lazy<E>, onTrue: Lazy<A>) =>
  (condition: boolean): either.Either<E, A> =>
    condition ? either.right(onTrue()) : either.left(onFalse());

export const guard =
  <E>(onFalse: Lazy<E>) =>
  (condition: boolean): either.Either<E, void> =>
    condition ? either.right(undefined) : either.left(onFalse());

export const toUndefined: <E, A>(_: either.Either<E, A>) => A | undefined = either.fold(
  constUndefined,
  identity,
);

/**
 * This re-export is necessary to remove the `readonly` modifier from the resulting Either<E, Array<A>>
 */
// eslint-disable-next-line import/export
export const traverseArray: <A, B, E>(
  f: (a: A) => either.Either<E, B>,
) => (as: readonly A[]) => either.Either<E, Array<B>> = either.traverseArray as $Unexpressable;

/**
 * This re-export is necessary to remove the `readonly` modifier from the resulting Either<E, Array<A>>
 */
// eslint-disable-next-line import/export
export const sequenceArray: <E, A>(
  as: readonly either.Either<E, A>[],
) => either.Either<E, Array<A>> = either.sequenceArray as $Unexpressable;
