import { constVoid } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { Body, ResponseType, getClient } from '@tauri-apps/api/http';
import { api } from 'api';

import { digestMessage } from '../utils/crypto';
import { listenForAuthTokens } from './listenForAuthToken';
import { getUniqueAppId } from './uniqueAppId';

const registerApp = async () => {
  const osName = await invoke('system_info');
  const appId = await getUniqueAppId();
  const appName = await getName();
  const appVersion = await getVersion();

  const requestBody = {
    osName,
    appId: digestMessage(appId as string),
    appName,
    appVersion,
  };
  //TODO send this request to registration endpoint
  console.log(requestBody);
  const client = await getClient();
  const response = await client.post(`${api.APIUrl}/app/register`, Body.json(requestBody), {
    responseType: ResponseType.Text,
  });
  console.log(response);
  listenForAuthTokens(appId);
};

// ignore promise due to safari 13 target
void registerApp().then(constVoid);
