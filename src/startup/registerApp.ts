import { invoke } from '@tauri-apps/api';
import { getName, getVersion } from '@tauri-apps/api/app';
import { getUniqueAppId } from './uniqueAppId';
import { constVoid } from '../prelude';
import { digestMessage } from '../utils/crypto';

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
};

// ignore promise due to safari 13 target
void registerApp().then(constVoid);
