import { Store } from 'tauri-plugin-store-api';
import { v4 as uuidv4 } from 'uuid';

const store = new Store('.settings.dat');

const createUniqeAppId = async () => {
  const appId = uuidv4();
  await store.set('appId', appId);
  await store.save();
};
export const getUniqueAppId = async () => {
  if (!(await store.has('appId'))) {
    await createUniqeAppId();
  }
  return await store.get('appId');
};
