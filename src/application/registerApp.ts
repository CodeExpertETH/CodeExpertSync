import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';
import { flow, iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { apiErrorToMessage, apiPost, requestBody } from '@/utils/api';
import { panic } from '@/utils/error';

const getSystemInfo: task.Task<{ os: string; name: string; version: string }> = task.sequenceS({
  os: pipe(
    api.getSystemInfo,
    taskOption.getOrElse(() => task.of('N/A')),
  ) /* TODO Figure out actual runtime type of getSystemInfo */,
  name: getName,
  version: getVersion,
});

export const registerApp = (): task.Task<ClientId> =>
  pipe(
    api.settingRead('clientId', ClientId),
    taskOption.getOrElse(() =>
      pipe(
        getSystemInfo,
        task.chain((systemInfo) =>
          pipe(
            apiPost({
              path: 'access/register',
              body: requestBody.json({
                ...systemInfo,
                permissions: ['user:read', 'project:read', 'project:write'],
              }),
              codec: iots.strict({ clientId: ClientId }),
            }),
            taskEither.getOrElse(flow(apiErrorToMessage, panic)),
            task.map(({ clientId }) => clientId),
            task.chainFirst((clientId) => api.settingWrite('clientId', clientId)),
          ),
        ),
      ),
    ),
  );
