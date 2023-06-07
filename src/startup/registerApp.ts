import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';
import { iots, option, pipe, task, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { createAPIRequest, requestBody } from '@/domain/createAPIRequest';
import { notificationT } from '@/ui/helper/notifications';
import { getClientToken } from './getClientToken';

export const registerApp = async () => {
  const os: string = pipe(
    await api.getSystemInfo(),
    option.getOrElse(() => 'N/A'),
  ); // fixme: figure out actual runtime type of getSystemInfo
  const name = await getName();
  const version = await getVersion();

  await pipe(
    api.settingRead('clientId', ClientId),
    taskEither.fromTaskOption(
      () => new Error('No client id was found. Please contact the developers.'),
    ),
    taskEither.map((clientId) => ({ clientId })),
    taskEither.altW(() =>
      pipe(
        getClientToken,
        taskEither.chain((token) => {
          const body = requestBody.json({
            os,
            permissions: ['user:read', 'project:read', 'project:write'],
            token,
            name,
            version,
          });
          return pipe(
            createAPIRequest({
              method: 'POST',
              path: 'app/register',
              body,
              codec: iots.strict({ clientId: iots.string }),
            }),
            taskEither.chainFirstTaskK(({ clientId }) => api.settingWrite('clientId', clientId)),
            taskEither.map(({ clientId }) => ({ clientId })),
          );
        }),
      ),
    ),
    taskEither.foldW((e) => notificationT.error(e), task.of),
    task.run,
  );
};
