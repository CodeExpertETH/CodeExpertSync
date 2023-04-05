import { constVoid, iots, pipe, taskEither } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';

import { ClientId } from '../domain/ClientId';
import { createAPIRequest } from '../domain/createAPIRequest';
import { getUniqueClientId } from './uniqueClientId';

const registerApp = async () => {
  const os = await invoke('system_info');
  const clientId = await getUniqueClientId();
  const name = await getName();
  const version = await getVersion();

  const requestBody = {
    os,
    permissions: ['project:read'],
    clientId,
    name,
    version,
  };

  const data = await pipe(
    createAPIRequest({
      path: `${api.APIUrl}/app/register`,
      payload: requestBody,
      method: 'POST',
      codec: iots.strict({ clientId: ClientId }),
    }),
    taskEither.chainTaskK(({ clientId }) => api.settingWrite('clientId', clientId)),
    taskEither.run,
  );
  console.log(data);
};

// ignore promise due to safari 13 target
void registerApp().then(constVoid);
