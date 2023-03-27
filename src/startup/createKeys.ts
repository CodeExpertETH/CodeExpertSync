import { iots, option, pipe, task } from '@code-expert/prelude';
import { api } from 'api';

const createKeys = (): task.Task<string> =>
  pipe(
    () => api.create_keys(),
    task.chainFirst((keys) => api.settingWrite('privateKey', keys.private_key)),
    task.chainFirst((keys) => api.settingWrite('publicKey', keys.public_key)),
    task.map((keys) => keys.public_key),
  );
export const getPubKey = async () => {
  const pubKey = await pipe(
    api.settingRead('publicKey', iots.string),
    task.map(option.toUndefined),
    task.run,
  );
  if (pubKey == null) {
    return task.run(createKeys());
  }
  return pubKey;
};
