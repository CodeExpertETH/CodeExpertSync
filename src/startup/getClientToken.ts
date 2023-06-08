import { iots, pipe, taskEither } from '@code-expert/prelude';
import { createAPIRequest } from '@/domain/createAPIRequest';

export const getClientToken = pipe(
  createAPIRequest({
    path: 'app/clientId',
    method: 'GET',
    payloadType: 'json',
    payload: {},
    codec: iots.strict({ token: iots.string }),
  }),
  taskEither.map(({ token }) => token),
);
