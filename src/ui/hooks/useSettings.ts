import { api } from 'api';
import React from 'react';
import { constant, iots, option, pipe, remote, remoteOption } from '@code-expert/prelude';
import { useTask } from '@/ui/hooks/useTask';

/**
 * Run a `Task` and represent the states before, during and after as `RemoteData`.
 */
export function useSettings<T>(
  key: string,
  decoder: iots.Decoder<unknown, T>,
  dependencyList: React.DependencyList,
): remoteOption.RemoteOption<T> {
  const [state, refresh] = useTask(api.settingRead<T>);

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
    // todo: OptionT.getOrElse does this:
    remote.map(option.getOrElse(constant(fallBack))),
    // todo: ...so we could also write it like this:
    // remoteOption.getOrElse(() => fallBack),
    // todo: however, I elected to have remoteOption.getOrElse to be: (onNone: LazyArg<A>)) => (fa: RemoteOption<A>) => A
    //   which is the same as remoteData.getOrElse.
  );
}
