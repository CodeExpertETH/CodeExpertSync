import { api } from 'api';
import { iots, pipe, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { createAPIRequest } from '@/domain/createAPIRequest';

export const getClientToken = pipe(
  api.settingRead('clientId', ClientId),
  taskEither.fromTaskOption(
    () => new Error('No client id was found. Please contact the developers.'),
  ),
  taskEither.alt(() =>
    pipe(
      createAPIRequest({
        path: 'app/clientId',
        method: 'GET',
        payload: {},
        codec: iots.strict({ token: iots.string }),
      }),
      taskEither.map(({ token }) => token),
    ),
  ),
);
