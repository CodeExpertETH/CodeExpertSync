import React from 'react';
import { pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception } from '@/domain/exception';
import { useRaceState } from '@/ui/hooks/useRaceState';

const getUserInfo = () =>
  createSignedAPIRequest({
    path: 'user/info',
    jwtPayload: {},
    method: 'GET',
    codec: UserInfoC,
  });

export const useUserInfo = () => {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, UserInfo>>(
    remoteData.initial,
  );

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      getUserInfo(),
      taskEither.mapLeft(remoteData.failure),
      taskEither.map(remoteData.success),
      taskEither.chainIOK((s) => () => setState(s)),
      taskEither.run,
    );
  }, [mkSetState]);

  return state;
};
