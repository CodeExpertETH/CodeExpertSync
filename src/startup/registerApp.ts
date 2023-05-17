import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';
import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { createAPIRequest } from '@/domain/createAPIRequest';
import { notificationT } from '@/ui/helper/notifications';
import { getClientToken } from './getClientToken';

export const registerApp = async () => {
  const os = await invoke('system_info');
  const name = await getName();
  const version = await getVersion();

  await pipe(
    api.settingRead('clientId', ClientId),
    taskEither.fromTaskOption(
      () => new Error('No client id was found. Please contact the developers.'),
    ),
    taskEither.map((clientId) => ({ clientId })),
    taskEither.alt(() =>
      pipe(
        getClientToken,
        taskEither.chain((token) => {
          const requestBody = {
            os,
            permissions: ['user:read', 'project:read', 'project:write'],
            token,
            name,
            version,
          };
          return pipe(
            createAPIRequest({
              path: 'app/register',
              payload: requestBody,
              method: 'POST',
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
