import { apply, eq, option, predicate, taskEither, taskOption } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import * as task from './task';

export * from 'fp-ts/TaskOption';

export const sequenceT = apply.sequenceT(taskOption.ApplicativePar);

export const elem =
  <A>(eq: eq.Eq<A>) =>
  (a: A): ((_: taskOption.TaskOption<A>) => Promise<boolean>) =>
    task.exists(option.elem(eq)(a));

export const exists = <A>(
  p: predicate.Predicate<A>,
): ((_: taskOption.TaskOption<A>) => Promise<boolean>) => task.exists(option.exists(p));

export const isSome: <A>(a: taskOption.TaskOption<A>) => Promise<boolean> = task.exists(
  option.isSome,
);

export const isNone: <A>(a: taskOption.TaskOption<A>) => Promise<boolean> = task.exists(
  option.isNone,
);

export const fromTaskEitherK = <E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => taskEither.TaskEither<E, B>,
): ((...a: A) => taskOption.TaskOption<B>) => flow(f, taskOption.fromTaskEither);

export const chainTaskEitherK =
  <E, A, B>(f: (a: A) => taskEither.TaskEither<E, B>) =>
  (ma: taskOption.TaskOption<A>): taskOption.TaskOption<B> =>
    pipe(ma, taskOption.chain(fromTaskEitherK(f)));
