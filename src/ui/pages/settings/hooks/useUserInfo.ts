import React from 'react';
import { pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, getUserInfo } from '@/domain/UserInfo';
import { Exception, fromError } from '@/domain/exception';
import { useRaceState } from '@/ui/hooks/useRaceState';

export const useUserInfo = () => {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, UserInfo>>(
    remoteData.initial,
  );

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      getUserInfo(),
      taskEither.mapLeft(fromError),
      taskEither.map(remoteData.success),
      taskEither.chainIOK((s) => () => setState(s)),
      taskEither.run,
    );
  }, [mkSetState]);

  return [state] as const;
};
