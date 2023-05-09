import { api } from 'api';
import React from 'react';
import { iots, pipe, remoteData, task, taskOption } from '@code-expert/prelude';
import { Exception, InvariantViolation } from '@/domain/exception';
import { useRaceState } from './useRaceState';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useSettings<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  dependencyList: React.DependencyList,
) {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, T>>(remoteData.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead(key, decoder),
      task.map((a) =>
        remoteData.fromOption(a, () => new InvariantViolation(`Setting ${key} was not found`)),
      ),
      task.map(setState),
      task.run,
    );
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

export function useSettingsFallback<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  fallBack: task.Task<T>,
  dependencyList: React.DependencyList,
) {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, T>>(remoteData.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead(key, decoder),
      taskOption.getOrElse(() => fallBack),
      task.map(remoteData.success),
      task.map(setState),
      task.run,
    );
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
