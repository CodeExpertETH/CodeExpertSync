import { task } from 'fp-ts';
import * as apply from './apply';
import { flow } from 'fp-ts/function';

export * from 'fp-ts/Task';

export const sequenceS = apply.sequenceS(task.ApplyPar);

export const sequenceT = apply.sequenceT(task.ApplyPar);

export const run = <A>(t: task.Task<A>): Promise<A> => t();

export const exists: <A>(f: (a: A) => boolean) => (fa: task.Task<A>) => Promise<boolean> = (f) =>
  flow(task.map(f), run);

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
