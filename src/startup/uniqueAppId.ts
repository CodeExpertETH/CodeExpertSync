import { iots, option, pipe, task } from '@code-expert/prelude';
import { api } from 'api';

import { AppId } from '../domain/AppId';
import { generateRandomId } from '../utils/crypto';

const createUniqeAppId = async (): Promise<AppId> => {
  const appId = generateRandomId(64);
  await task.run(api.settingWrite('appId', appId));
  return iots.brandFromLiteral(appId);
};
export const getUniqueAppId = async () => {
  const appId = await pipe(api.settingRead('appId', AppId), task.map(option.toUndefined), task.run);
  if (!appId) {
    return await createUniqeAppId();
  }
  return appId;
};
