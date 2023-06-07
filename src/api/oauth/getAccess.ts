import { iots } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { createAPIRequest, requestBody } from '@/domain/createAPIRequest';

const responseCodec = iots.null;
export const getAccess = (
  clientId: ClientId,
  code_verifier: string,
  authToken: string,
  pubKey: string,
) => {
  const body = requestBody.json({
    clientId,
    authToken,
    code_verifier,
    pubKey,
  });

  return createAPIRequest({
    method: 'POST',
    path: 'app/oauth/gainAccess',
    body,
    codec: responseCodec,
  });
};
