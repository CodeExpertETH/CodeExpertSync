import { api } from 'api';
import { either } from 'fp-ts';
import { Errors } from 'io-ts';

import { AccessToken } from '../../domain/AuthToken';
import { getUniqueAppId } from '../../startup/uniqueAppId';
import { digestMessage } from '../../utils/crypto';
import { getAccessToken } from './getAccessToken';

export const listenForAuthTokens = async (
  code_verifier: string,
  dispatch: (accessToken: either.Either<Error | Errors, AccessToken>) => void,
) => {
  const appId = await getUniqueAppId();

  const sse = new EventSource(`${api.APIUrl}/app/oauth/listenForAuthToken/${digestMessage(appId)}`);
  sse.addEventListener(
    'authToken',
    async ({ data: authToken }) => {
      console.log(authToken);
      if (authToken != null) {
        await getAccessToken(code_verifier, authToken, dispatch);
        sse.close();
      }
    },
    { once: true },
  );
};
