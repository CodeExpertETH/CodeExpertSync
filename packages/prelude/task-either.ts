import { $Unexpressable } from '@code-expert/type-utils';
import { either, io } from 'fp-ts';
import * as Ap from 'fp-ts/Apply';
import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { TaskEither } from 'fp-ts/TaskEither';
import { FunctionN, constFalse, flow, identity, pipe } from 'fp-ts/function';
import * as eitherT from './eithert';
import * as functor from './functor';
import * as task from './task';

// eslint-disable-next-line import/export
export * from 'fp-ts/TaskEither';

export const sequenceS = Ap.sequenceS(TE.ApplyPar);

export const sequenceT = Ap.sequenceT(TE.ApplyPar);

export const traverseArrayValidation =
  <A, B, E>(f: (a: A) => TE.TaskEither<ReadonlyArray<E>, B>) =>
  (arr: Array<A>): TE.TaskEither<ReadonlyArray<E>, ReadonlyArray<B>> =>
    pipe(arr, RA.traverse(TE.getApplicativeTaskValidation(task.ApplyPar, RA.getSemigroup<E>()))(f));

export const sequenceArrayValidation: <A, E>(
  arr: Array<TE.TaskEither<ReadonlyArray<E>, A>>,
) => TE.TaskEither<ReadonlyArray<E>, ReadonlyArray<A>> = traverseArrayValidation(identity);

/**
 * This intentionally accepts only {@link taskEither.TaskEither TaskEither<E, void>}, to make it harder to just discard
 * the case where the {@link either.Either Either} is {@link either.Left Left}.
 *
 * If you need to move into imperative territory and want to process the Either further, use {@link task.toPromise}.
 */
export const run: <E>(onLeft: (e: E) => void) => (fa: TE.TaskEither<E, void>) => void = (onLeft) =>
  flow(TE.matchW(onLeft, identity), (t) => void t());

export const runUnion: <E, A, B>(
  f: (e: E) => B,
  g: (a: A) => B,
) => (fa: TE.TaskEither<E, A>) => Promise<B> = (f, g) =>
  flow(TE.bimap(f, g), TE.toUnion, (t) => t());

export const exists: <E, A>(
  f: (a: A) => boolean,
) => (fa: TE.TaskEither<E, A>) => Promise<boolean> = (f) => runUnion(constFalse, f);

export const existsLeft: <E, A>(
  f: (e: E) => boolean,
) => (fa: TE.TaskEither<E, A>) => Promise<boolean> = (f) => runUnion(f, constFalse);

export const tryCatch2: <E>(
  onRejected: (reason: unknown) => E,
) => <A>(fa: task.Task<A>) => TE.TaskEither<E, A> = (onRejected) => (fa) =>
  TE.tryCatch(fa, onRejected);

/**
 * Fold over the left and right values using IOs.
 */
export const foldIO = <E, A, B>(
  onLeft: FunctionN<[E], io.IO<B>>,
  onRight: FunctionN<[A], io.IO<B>>,
): FunctionN<[TE.TaskEither<E, A>], task.Task<B>> =>
  flow(TE.chainIOK(onRight), TE.getOrElse(flow(onLeft, task.fromIO)));

export const map2 = eitherT.map2(task.ApplicativePar);

export const bindTaskK = <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => task.Task<B>,
): (<E>(
  ma: TaskEither<E, A>,
) => TaskEither<E, { readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>) =>
  TE.bind(name, (a) => TE.fromTask(f(a)));

export const isRight: <E, A>(fa: TE.TaskEither<E, A>) => Promise<boolean> = task.exists(
  either.isRight,
);

export const toVoid: <E, A>(fa: TE.TaskEither<E, A>) => TE.TaskEither<E, void> = functor.toVoid(
  TE.Functor,
);

/**
 * This re-export is necessary to remove the `readonly` modifier from the resulting Either<E, Array<A>>
 */
// eslint-disable-next-line import/export
export const traverseArray: <A, B, E>(
  f: (a: A) => TE.TaskEither<E, B>,
) => (as: readonly A[]) => TE.TaskEither<E, B[]> = TE.traverseArray as $Unexpressable;
