import { iots } from '@code-expert/prelude';

import { AppId } from '../../domain/AppId';
import { AccessToken } from '../../domain/AuthToken';
import { createAPIRequest } from '../../domain/createAPIRequest';
import { digestMessage } from '../../utils/crypto';

const responseCodec = iots.strict({
  accessToken: AccessToken,
});
export const getAccessToken = (appId: AppId, code_verifier: string, authToken: string) => {
  const requestBody = {
    appId: digestMessage(appId as string),
    authToken,
    code_verifier,
  };

  return createAPIRequest({
    path: 'app/oauth/token',
    payload: requestBody,
    method: 'POST',
    codec: responseCodec,
  });
};
