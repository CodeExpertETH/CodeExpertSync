import { either, iots } from '@code-expert/prelude';
import { api } from 'api';

import { AccessToken } from '../../domain/AuthToken';
import { getUniqueAppId } from '../../startup/uniqueAppId';
import { digestMessage } from '../../utils/crypto';
import { getAccessToken } from './getAccessToken';

let sse: EventSource | undefined;
export const listenForAuthTokens = async (
  code_verifier: string,
  dispatch: (accessToken: either.Either<Error | iots.Errors, AccessToken>) => void,
) => {
  const appId = await getUniqueAppId();

  if (sse != null) {
    sse.close();
  }
  sse = new EventSource(`${api.APIUrl}/app/oauth/listenForAuthToken/${digestMessage(appId)}`);
  sse.addEventListener(
    'authToken',
    async ({ data: authToken }) => {
      if (authToken != null) {
        await getAccessToken(code_verifier, authToken, dispatch);
        sse?.close();
        sse = undefined;
      } else {
        dispatch(
          either.left(new Error('No access token received from the server. Please try again.')),
        );
      }
    },
    { once: true },
  );

  sse.addEventListener('error', (e) => {
    dispatch(either.left(new Error(`An error occurred while attempting to connect: ${e}`)));
  });
};
