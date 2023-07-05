import { task, taskOption } from '@code-expert/prelude';
import type { Api } from '../../src/api';

const settingsStore = new Map();

export const api: Api = {
  getVersion: task.of('Version: Storybook'),
  create_keys: task.of('FIXME secret-key'),
  create_jwt_tokens: () => task.of('FIXME jwt-token'),
  buildTar: () => task.of('FIXME hash'),
  settingRead: (key) => taskOption.fromIO(() => settingsStore.get(key)),
  settingWrite: (key, value) => () => {
    settingsStore.set(key, value);
    return Promise.resolve(undefined);
  },
  exists: () => task.of(true) /* FIXME Correct implementation */,
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
