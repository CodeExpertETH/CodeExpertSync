import { iots } from '@code-expert/prelude';

import { ClientId } from '../../domain/ClientId';
import { createAPIRequest } from '../../domain/createAPIRequest';

const responseCodec = iots.strict({});
export const getAccess = (
  clientId: ClientId,
  code_verifier: string,
  authToken: string,
  pubKey: string,
) => {
  const requestBody = {
    clientId,
    authToken,
    code_verifier,
    pubKey,
  };

  return createAPIRequest({
    path: 'app/oauth/gainAccess',
    payload: requestBody,
    method: 'POST',
    codec: responseCodec,
  });
};