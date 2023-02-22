import type { Api, Store } from '../../src/api';

export const store: Store = {
  get: <T>() => Promise.resolve('' as T),
  set: () => Promise.resolve(undefined),
  save: () => Promise.resolve(undefined),
};

export const api: Api = {
  getVersion: () => Promise.resolve('Version: Storybook'),
  greet: (name) => Promise.resolve(`Hello from Storybook, ${name}!`),
  store,
};
