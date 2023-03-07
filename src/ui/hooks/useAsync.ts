import React from 'react';

import { Exception, fromError } from '../../domain/exception';
import { flow, remoteData, task } from '../../prelude';
import { useRaceState } from './useRaceState';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useAsync<A>(run: task.Task<A>, dependencyList: React.DependencyList) {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, A>>(remoteData.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void run().then(remoteData.success, flow(fromError, remoteData.failure)).then(setState);
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
