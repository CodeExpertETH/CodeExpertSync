import { iots, pipe, task } from '@code-expert/prelude';

import { ClientId } from '../../domain/ClientId';
import { createAPIRequest } from '../../domain/createAPIRequest';
import { digestMessage } from '../../utils/crypto';

const responseCodec = iots.strict({});
export const getAccess = (
  clientId: ClientId,
  code_verifier: string,
  authToken: string,
  pubKey: string,
) => {
  const requestBody = {
    clientId: digestMessage(clientId as string),
    authToken,
    code_verifier,
    pubKey,
  };

  return pipe(
    createAPIRequest({
      path: 'app/oauth/gainAccess',
      payload: requestBody,
      method: 'POST',
      codec: responseCodec,
    }),
    task.run,
  );
};
