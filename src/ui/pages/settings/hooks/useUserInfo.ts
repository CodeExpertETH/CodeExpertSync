import { flow, pipe, remoteData, taskEither } from '@code-expert/prelude';
import { UserInfo, UserInfoC } from '@/domain/UserInfo';
import { useAsync } from '@/ui/hooks/useAsync';
import { apiErrorToMessage, apiGetSigned } from '@/utils/api';
import { toFatalError } from '@/utils/error';

const getUserInfo = pipe(
  apiGetSigned({
    path: 'user/info',
    codec: UserInfoC,
  }),
  taskEither.getOrThrow(flow(apiErrorToMessage, toFatalError)),
);

export const useUserInfo = (): remoteData.Remote<UserInfo> => useAsync(getUserInfo, []);
