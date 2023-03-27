import { iots } from '@code-expert/prelude';

import { AppId } from '../../domain/AppId';
import { createAPIRequest } from '../../domain/createAPIRequest';
import { digestMessage } from '../../utils/crypto';

const responseCodec = iots.strict({});
export const getAccess = (
  appId: AppId,
  code_verifier: string,
  authToken: string,
  pubKey: string,
) => {
  const requestBody = {
    appId: digestMessage(appId as string),
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
