import { taskOption } from '../../src/prelude';
import type { Api } from '../../src/api';

const store = new Map();

export const api: Api = {
  getVersion: () => Promise.resolve('Version: Storybook'),
  greet: (name) => Promise.resolve(`Hello from Storybook, ${name}!`),
  settingRead: (key) => taskOption.fromIO(() => store.get(key)),
  settingWrite: (key, value) => () => {
    store.set(key, value);
    return Promise.resolve(undefined);
  },
};
