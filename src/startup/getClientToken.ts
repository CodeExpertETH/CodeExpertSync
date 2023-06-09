import { iots, pipe, taskEither } from '@code-expert/prelude';
import { createAPIRequest } from '@/domain/createAPIRequest';

export const getClientToken = pipe(
  createAPIRequest({
    method: 'GET',
    path: 'app/clientId',
    codec: iots.strict({ token: iots.string }),
  }),
  taskEither.map(({ token }) => token),
);
