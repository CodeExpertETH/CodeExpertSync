import { getName, getVersion } from '@tauri-apps/api/app';
import { api } from 'api';
import { flow, iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { apiErrorToMessage, apiGet, apiPost, requestBody } from '@/utils/api';
import { panic } from '@/utils/error';

const getSystemInfo: task.Task<{ os: string; name: string; version: string }> = task.sequenceS({
  os: pipe(
    api.getSystemInfo,
    taskOption.getOrElse(() => task.of('N/A')),
  ) /* TODO Figure out actual runtime type of getSystemInfo */,
  name: getName,
  version: getVersion,
});

const getRegistrationToken: task.Task<string> = pipe(
  apiGet({
    path: 'access/register',
    codec: iots.strict({ token: iots.string }),
  }),
  taskEither.getOrElse(flow(apiErrorToMessage, panic)),
  task.map(({ token }) => token),
);

export const registerApp = (): task.Task<ClientId> =>
  pipe(
    api.settingRead('clientId', ClientId),
    taskOption.getOrElse(() =>
      pipe(
        task.Do,
        task.bind('systemInfo', () => getSystemInfo),
        task.bind('token', () => getRegistrationToken),
        task.chain(({ systemInfo, token }) =>
          pipe(
            apiPost({
              path: 'access/register',
              body: requestBody.json({
                ...systemInfo,
                token,
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
