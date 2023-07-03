import { api } from 'api';
import React from 'react';
import { iots, pipe, remoteData } from '@code-expert/prelude';
import { useRemoteDataOption } from '@/ui/hooks/useRemoteData';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useSettings<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  dependencyList: React.DependencyList,
): remoteData.RemoteDataOption<T> {
  const [state, refresh] = useRemoteDataOption(api.settingRead<T>);

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
): remoteData.RemoteDataA<T> {
  return pipe(
    useSettings(key, decoder, dependencyList),
    remoteData.fold3(
      () => remoteData.pending,
      () => remoteData.success(fallBack),
      remoteData.success,
    ),
  );
}
