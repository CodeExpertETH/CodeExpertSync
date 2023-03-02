import { generateRandomId } from '../utils/crypto';
import { option, pipe, task } from '../prelude';
import { api } from 'api';
import { AppId } from '../domain/AppId';

const createUniqeAppId = async () => {
  const appId = generateRandomId(64);
  await task.run(api.settingWrite('appId', appId));
};
export const getUniqueAppId = async () => {
  const appId = await pipe(api.settingRead('appId', AppId), task.map(option.toUndefined), task.run);
  if (!appId) {
    await createUniqeAppId();
  }
  return appId;
};
