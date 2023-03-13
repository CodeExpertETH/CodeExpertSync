import { api } from 'api';

import { AppId } from '../domain/AppId';

export const listenForAuthTokens = (appId: AppId) => {
  const sse = new EventSource(`${api.APIUrl}/app/listenForAuthToken/${appId}`);
  sse.onmessage = function (event) {
    console.log('New message', event.data);
    // will log 3 times for the data stream above
  };
};
