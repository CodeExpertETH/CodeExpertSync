import React from 'react';
import {
  fn,
  pipe,
  remote,
  remoteEither,
  remoteOption,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { useRaceState } from './useRaceState';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 *
 * Because we're dealing with a Task, there is no error channel.
 */
export function useRemote<P extends ReadonlyArray<unknown>, A>(
  run: (...props: P) => task.Task<A>,
): [remote.Remote<A>, (...props: P) => void] {
  const [state, mkSetState] = useRaceState<remote.Remote<A>>(remote.initial);

  const { current } = React.useRef({
    run,
    refresh(...props: P) {
      const setState = mkSetState();
      setState(remote.pending);
      pipe(
        current.run(...props),
        task.map(remote.of),
        task.chainIOK((x) => () => setState(x)),
        task.run,
      );
    },
  });

  current.run = run;

  return fn.tuple(state, current.refresh);
}

/**
 * Run a `TaskOption` and represent the states before, during and after as `RemoteData`.
 */
export function useRemoteOption<P extends ReadonlyArray<unknown>, A>(
  run: (...props: P) => taskOption.TaskOption<A>,
): [remoteOption.RemoteOption<A>, (...props: P) => void] {
  return useRemote(run);
}

/**
 * Run a `TaskEither` and represent the states before, during and after as `RemoteData`.
 */
export function useRemoteEither<P extends ReadonlyArray<unknown>, E, A>(
  run: (...props: P) => taskEither.TaskEither<E, A>,
): [remoteEither.RemoteEither<E, A>, (...props: P) => void] {
  return useRemote(run);
}

/**
 * @deprecated Use {@link useRemoteEither} if an error channel is needed.
 */
export const useRemoteData = useRemoteEither;
