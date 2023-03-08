import { eq, option, predicate, taskOption } from 'fp-ts';

import * as task from './task';

export * from 'fp-ts/TaskOption';

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
