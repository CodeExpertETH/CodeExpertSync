import { Body, ResponseType, getClient } from '@tauri-apps/api/http';
import { api } from 'api';

import { InvariantViolation } from '../domain/exception';
import { digestMessage } from '../utils/crypto';
import { getUniqueAppId } from './uniqueAppId';

export const getAccessToken = async (authToken: string) => {
  const appId = await getUniqueAppId();
  const code_verifier = await sessionStorage.getItem('code_verifier');
  if (code_verifier == null) {
    throw new InvariantViolation('Require to have a code verifier in session storage');
  }

  const requestBody = {
    appId: digestMessage(appId as string),
    authToken,
    code_verifier,
  };

  const client = await getClient();
  const response = await client.post(`${api.APIUrl}/app/oauth/token`, Body.json(requestBody), {
    responseType: ResponseType.JSON,
  });
  console.log(response);
};
