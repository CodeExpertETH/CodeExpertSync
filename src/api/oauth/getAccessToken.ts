import { either, pipe } from '@code-expert/prelude';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { AppId } from '../../domain/AppId';
import { AccessToken } from '../../domain/AuthToken';
import { fromError } from '../../domain/exception';
import { digestMessage } from '../../utils/crypto';

export const getAccessToken = async (appId: AppId, code_verifier: string, authToken: string) => {
  const requestBody = {
    appId: digestMessage(appId as string),
    authToken,
    code_verifier,
  };

  const response = await fetch<{ accessToken: string }>(`${api.APIUrl}/app/oauth/token`, {
    method: 'POST',
    body: Body.json(requestBody),
    responseType: ResponseType.JSON,
  });
  return pipe(
    response.data.accessToken,
    either.fromNullable(Error('No access token returned')),
    either.chainW(AccessToken.decode),
    either.getOrThrow(fromError),
  );
};
