import { constVoid } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { api } from 'api';

import { digestMessage } from '../utils/crypto';
import { getUniqueClientId } from './uniqueClientId';

const registerApp = async () => {
  const os = await invoke('system_info');
  const clientId = await getUniqueClientId();
  const name = await getName();
  const version = await getVersion();

  const requestBody = {
    os,
    permissions: ['project:read'],
    clientId: digestMessage(clientId as string),
    name,
    version,
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
