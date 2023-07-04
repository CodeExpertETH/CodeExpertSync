import fromThrown from 'normalize-exception';
import { pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { useAsync } from '@/ui/hooks/useAsync';

const getUserInfo = createSignedAPIRequest({
  path: 'user/info',
  jwtPayload: {},
  method: 'GET',
  codec: UserInfoC,
});

export const useUserInfo = (): remoteData.Remote<UserInfo> =>
  useAsync(pipe(getUserInfo, taskEither.getOrThrow(fromThrown)), []);
