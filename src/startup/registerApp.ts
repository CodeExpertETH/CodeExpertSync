import { constVoid, iots, pipe, taskEither } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';

import { createAPIRequest } from '../domain/createAPIRequest';
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
        permissions: ['project:read'],
        token,
        name,
        version,
      };

      return pipe(
        createAPIRequest({
          path: `${api.APIUrl}/app/register`,
          payload: requestBody,
          method: 'POST',
          codec: iots.strict({ clientId: iots.string }),
        }),
        taskEither.chainFirstTaskK(({ clientId }) => api.settingWrite('clientId', clientId)),
      );
    }),
    taskEither.run,
  );
};

// ignore promise due to safari 13 target
void registerApp().then(constVoid);
