import { api } from 'api';
import React from 'react';
import { constant, iots, option, pipe, remote, remoteOption } from '@code-expert/prelude';
import { useRemoteOption } from '@/ui/hooks/useRemoteData';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useSettings<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  dependencyList: React.DependencyList,
): remoteOption.RemoteOption<T> {
  const [state, refresh] = useRemoteOption(api.settingRead<T>);

  React.useEffect(() => {
    refresh(key, decoder);
  }, dependencyList); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

export function useSettingsFallback<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  fallBack: T,
  dependencyList: React.DependencyList,
): remote.Remote<T> {
  return pipe(
    useSettings(key, decoder, dependencyList),
    // FIXME this change demonstrates the difference between implementations well
    remote.map(option.getOrElse(constant(fallBack))),
  );
}
