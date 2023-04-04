import { iots, option, pipe, task } from '@code-expert/prelude';
import { api } from 'api';

import { ClientId } from '../domain/ClientId';
import { generateRandomId } from '../utils/crypto';

const createUniqeClientId = async (): Promise<ClientId> => {
  const clientId = generateRandomId(64);
  await task.run(api.settingWrite('clientId', clientId));
  return iots.brandFromLiteral(clientId);
};
export const getUniqueClientId = async () => {
  const clientId = await pipe(
    api.settingRead('clientId', ClientId),
    task.map(option.toUndefined),
    task.run,
  );
  if (!clientId) {
    return await createUniqeClientId();
  }
  return clientId;
};
