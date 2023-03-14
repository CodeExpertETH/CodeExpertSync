import { constVoid } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { digestMessage } from '../utils/crypto';
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
  const response = await fetch(`${api.APIUrl}/app/register`, {
    method: 'POST',
    body: Body.json(requestBody),
    responseType: ResponseType.Text,
  });
  if (!response.ok) {
    throw new Error('App could not register during startup');
  }
};

// ignore promise due to safari 13 target
void registerApp().then(constVoid);
