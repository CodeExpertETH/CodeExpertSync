import React from 'react';
import { flow, remoteData, task } from '@code-expert/prelude';
import { useRaceState } from './useRaceState';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useAsync<A>(run: task.Task<A>, dependencyList: React.DependencyList) {
  const [state, mkSetState] = useRaceState<remoteData.Remote<A>>(remoteData.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void run().then(flow(remoteData.success, setState));
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
