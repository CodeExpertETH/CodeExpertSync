import type { Api, Store } from '../../src/api';
import { constUndefined } from '../../src/prelude';

export const store = ((): Store => {
  const TestStore = new Map();
  return {
    get: (key) => Promise.resolve(TestStore.get(key)),
    set: (key, value) => Promise.resolve(TestStore.set(key, value)).then(constUndefined),
    save: () => Promise.resolve(undefined),
    delete: (key) => Promise.resolve(TestStore.delete(key)),
  };
})();

export const api: Api = {
  getVersion: () => Promise.resolve('Version: Storybook'),
  greet: (name) => Promise.resolve(`Hello from Storybook, ${name}!`),
  store,
};
