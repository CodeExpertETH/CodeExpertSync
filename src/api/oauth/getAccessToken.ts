import { either, iots, pipe } from '@code-expert/prelude';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { AccessToken } from '../../domain/AuthToken';
import { getUniqueAppId } from '../../startup/uniqueAppId';
import { digestMessage } from '../../utils/crypto';

export const getAccessToken = async (
  code_verifier: string,
  authToken: string,
  dispatch: (accessToken: either.Either<Error | iots.Errors, AccessToken>) => void,
) => {
  const appId = await getUniqueAppId();

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
  dispatch(
    pipe(
      response.data.accessToken,
      either.fromNullable(Error('No access token returned')),
      either.chainW(AccessToken.decode),
    ),
  );
};
