import { flow, pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { useAsync } from '@/ui/hooks/useAsync';
import { apiErrorToMessage, apiGetSigned } from '@/utils/api';
import { panic } from '@/utils/error';

const getUserInfo = pipe(
  apiGetSigned({
    path: 'user/info',
    codec: UserInfoC,
  }),
  taskEither.getOrElse(flow(apiErrorToMessage, panic)),
);

export const useUserInfo = (): remoteData.Remote<UserInfo> => useAsync(getUserInfo, []);
