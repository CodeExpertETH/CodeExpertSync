import { either, option, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import type { Api } from '../../src/api';

const configStore = new Map();
const fileStore = new Map();
const settingsStore = new Map();

export const api: Api = {
  getVersion: () => () => Promise.resolve(either.right('Version: Storybook')),
  create_keys: () => taskEither.of('FIXME secret-key'),
  create_jwt_tokens: () => taskEither.of('FIXME jwt-token'),
  settingRead: (key) => taskOption.fromIO(() => settingsStore.get(key)),
  settingWrite: (key, value) => () => {
    settingsStore.set(key, value);
    return Promise.resolve(option.some(undefined));
  },
  exists: () => task.of(true) /* FIXME Correct implementation */,
  writeConfigFile: (name, value) =>
    taskEither.fromIO(() => {
      configStore.set(name, value);
    }),
  writeFile: (filePath, content) =>
    taskEither.fromIO(() => {
      fileStore.set(filePath, content);
    }),
  removeDir: () => {
    throw new Error('[Storybook] Not implemented');
  },
  getFileHash: () => {
    throw new Error('[Storybook] Not implemented');
  },
  createProjectDir: () => {
    throw new Error('[Storybook] Not implemented');
  },
  readConfigFile: (name, decoder) =>
    pipe(configStore.get(name), decoder.decode, taskOption.fromEither),
  hasConfigFile: (name) => task.fromIO(() => configStore.get(name) != null),
  logout: () => taskOption.of(undefined),
};
