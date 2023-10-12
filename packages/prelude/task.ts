import { $Unexpressable } from '@code-expert/type-utils';
import { task } from 'fp-ts';
import { flow } from 'fp-ts/function';
import * as apply from './apply';

// eslint-disable-next-line import/export
export * from 'fp-ts/Task';

export const sequenceS = apply.sequenceS(task.ApplyPar);

export const sequenceT = apply.sequenceT(task.ApplyPar);

export const toPromise = <A>(t: task.Task<A>): Promise<A> => t();

/**
 * This is intentionally typed to accept only Task<void>, to make it harder to just discard inner values which possible carry error channels, e.g. Option or Either.
 * If you need to move into imperative territory and want to process the inner value further, use {@link toPromise}.
 */
export const run = (t: task.Task<void>): void => void t();

export const exists: <A>(f: (a: A) => boolean) => (fa: task.Task<A>) => Promise<boolean> = (f) =>
  flow(task.map(f), toPromise);

export const map2 = apply.map2(task.ApplyPar);

export const map3 = apply.map3(task.ApplyPar);

type AsyncFunction<A extends Array<unknown>, B> = (...args: A) => Promise<B>;

export const fromPromiseK: <F extends CallableFunction>(
  f: F extends AsyncFunction<infer _A, infer _B> ? F : () => Promise<unknown>,
) => F extends AsyncFunction<infer A, infer B> ? (...args: A) => task.Task<B> : never = ((
    f: (...args: []) => unknown,
  ) =>
  (...args: []) =>
  () =>
    f(...args)) as $Unexpressable;

/**
 * This re-export is necessary to remove the `readonly` modifier from the resulting Either<E, Array<A>>
 */
// eslint-disable-next-line import/export
export const traverseArray: <A, B>(
  f: (a: A) => task.Task<B>,
) => (as: readonly A[]) => task.Task<B[]> = task.traverseArray as $Unexpressable;
