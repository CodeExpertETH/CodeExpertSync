import React from 'react';
import { LazyArg, pipe, remote, task } from '@code-expert/prelude';
import { useRaceState } from './useRaceState';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useAsync<A>(run: LazyArg<task.Task<A>>, dependencyList: React.DependencyList) {
  const [state, mkSetState] = useRaceState<remote.Remote<A>>(remote.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      run(),
      task.map(remote.of),
      task.chainIOK((x) => () => setState(x)),
      task.run,
    );
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
