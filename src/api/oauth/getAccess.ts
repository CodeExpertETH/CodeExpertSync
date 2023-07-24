import { iots } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { apiPost, requestBody } from '@/utils/api';

const codec = iots.null;

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

  return apiPost({ path: 'access/verify', body, codec });
};
