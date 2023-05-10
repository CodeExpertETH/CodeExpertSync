import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';
import { constVoid, iots, pipe, task, taskEither } from '@code-expert/prelude';
import { createAPIRequest } from '@/domain/createAPIRequest';
import { notificationT } from '@/ui/helper/notifications';
import { getClientToken } from './getClientToken';

const registerApp = async () => {
  const os = await invoke('system_info');
  const name = await getName();
  const version = await getVersion();

  await pipe(
    getClientToken,
    taskEither.chain((token) => {
      const requestBody = {
        os,
        permissions: ['project:read', 'project:write'],
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
      );
    }),
    taskEither.foldW(notificationT.error, task.of),
    task.run,
  );
};

// TODO: we shouldn't do this if we're already authenticated!
// ignore promise due to safari 13 target
void registerApp().then(constVoid);
