import { either, option, task, taskEither, taskOption } from '@code-expert/prelude';
import type { Api } from '../../src/api';

const fileStore = new Map();
const settingsStore = new Map();

export const api: Api = {
  getVersion: () => () => Promise.resolve(either.right('Version: Storybook')),
  create_keys: () => taskEither.of('FIXME secret-key'),
  create_jwt_tokens: () => taskEither.of('FIXME jwt-token'),
  buildTar: () => taskEither.of('FIXME hash'),
  settingRead: (key) => taskOption.fromIO(() => settingsStore.get(key)),
  settingWrite: (key, value) => () => {
    settingsStore.set(key, value);
    return Promise.resolve(option.some(undefined));
  },
  exists: () => task.of(true) /* FIXME Correct implementation */,
  writeFile: (filePath, content) =>
    taskEither.fromIO(() => {
      fileStore.set(filePath, content);
    }),
  writeProjectFile: () => {
    throw new Error('[Storybook] Not implemented');
  },
  removeDir: () => {
    throw new Error('[Storybook] Not implemented');
  },
  getFileHash: () => {
    throw new Error('[Storybook] Not implemented');
  },
  createProjectDir: () => {
    throw new Error('[Storybook] Not implemented');
  },
  createProjectPath: () => {
    throw new Error('[Storybook] Not implemented');
  },
  logout: () => task.of(undefined),
  getSystemInfo: taskOption.of('Storybook'),
  restart: task.of(undefined),
};
