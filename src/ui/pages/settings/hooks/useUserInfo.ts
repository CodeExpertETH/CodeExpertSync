import fromThrown from 'normalize-exception';
import { pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { useAsync } from '@/ui/hooks/useAsync';
import { httpGetSigned } from '@/utils/httpSigned';

const getUserInfo = httpGetSigned({
  path: 'user/info',
  codec: UserInfoC,
});

export const useUserInfo = (): remoteData.Remote<UserInfo> =>
  useAsync(pipe(getUserInfo, taskEither.getOrThrow(fromThrown)), []);
