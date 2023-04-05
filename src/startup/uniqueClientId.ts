import { option, pipe, task } from '@code-expert/prelude';
import { api } from 'api';

import { ClientId } from '../domain/ClientId';

export const getUniqueClientId = async () =>
  await pipe(api.settingRead('clientId', ClientId), task.map(option.toUndefined), task.run);
