import fromThrown from 'normalize-exception';
import { pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { useRemoteDataA } from '@/ui/hooks/useRemoteData';

const getUserInfo = createSignedAPIRequest({
  path: 'user/info',
  jwtPayload: {},
  method: 'GET',
  codec: UserInfoC,
});

export const useUserInfo = (): remoteData.RemoteDataA<UserInfo> => {
  const [state] = useRemoteDataA(() => pipe(getUserInfo, taskEither.getOrThrow(fromThrown)));
  return state;
};
