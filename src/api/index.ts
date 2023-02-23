import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api';
import { Store as TauriStore } from 'tauri-plugin-store-api';

export type Store = Pick<TauriStore, 'delete' | 'get' | 'set' | 'save'>;

export interface Api {
  getVersion(): Promise<string>;
  greet(name: string): Promise<string>;
  store: Store;
}

export const api: Api = {
  getVersion,
  greet: (name) => invoke('greet', { name }),
  store: new TauriStore('.settings.dat'),
};
