import { api } from 'api';

import { getAccessToken } from './getAccessToken';

export const listenForAuthTokens = (appId: string) => {
  const sse = new EventSource(`${api.APIUrl}/app/oauth/listenForAuthToken/${appId}`);
  console.log('waiting for events');
  sse.addEventListener(
    'authToken',
    async ({ data }) => {
      const authToken = data;
      if (authToken != null) {
        console.log('AuthToken', authToken);
        await getAccessToken(authToken);
        sse.close();
      }
    },
    { once: true },
  );
};
