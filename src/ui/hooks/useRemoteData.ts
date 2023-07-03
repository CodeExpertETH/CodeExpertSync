import React from 'react';
import {
  constUndefined,
  either,
  flow,
  fn,
  pipe,
  remoteData,
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
export function useRemoteDataA<P extends ReadonlyArray<unknown>, A>(
  run: (...props: P) => task.Task<A>,
): [remoteData.RemoteDataA<A>, (...props: P) => void] {
  return useRemoteDataEither(flow(run, task.map(either.right)));
}

/**
 * Run a `TaskOption` and represent the states before, during and after as `RemoteData`.
 */
export function useRemoteDataOption<P extends ReadonlyArray<unknown>, A>(
  run: (...props: P) => taskOption.TaskOption<A>,
): [remoteData.RemoteDataOption<A>, (...props: P) => void] {
  return useRemoteDataEither(flow(run, task.map(either.fromOption(constUndefined))));
}

/**
 * Run a `TaskEither` and represent the states before, during and after as `RemoteData`.
 */
export function useRemoteDataEither<P extends ReadonlyArray<unknown>, E, A>(
  run: (...props: P) => taskEither.TaskEither<E, A>,
): [remoteData.RemoteData<E, A>, (...props: P) => void] {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<E, A>>(remoteData.initial);

  const { current } = React.useRef({
    run,
    refresh(...props: P) {
      const setState = mkSetState();
      setState(remoteData.pending);
      void pipe(
        current.run(...props),
        task.map(remoteData.fromEither),
        task.chainIOK((x) => () => setState(x)),
        task.run,
      );
    },
  });

  current.run = run;

  return fn.tuple(state, current.refresh);
}

/**
 * @deprecated Use {@link useRemoteDataEither} if an error channel is needed.
 */
export const useRemoteData = useRemoteDataEither;
