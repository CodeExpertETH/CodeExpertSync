import { iots, option, pipe, task, taskOption } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { BaseDirectory, exists, writeTextFile } from '@tauri-apps/api/fs';
import { Store as TauriStore } from 'tauri-plugin-store-api';

const store = new TauriStore('.settings.dat');

export interface Api {
  getVersion(): Promise<string>;
  greet(name: string): Promise<string>;
  create_keys(): Promise<{ public_key: string; private_key: string }>;
  create_jwt_tokens(claims: Record<string, unknown>): Promise<string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): task.Task<void>;
  writeConfigFile(name: string, value: string): task.Task<void>;
  hasConfigFile(name: string): task.Task<boolean>;
  logout(): task.Task<void>;
  CXUrl: string;
  APIUrl: string;
}

export const api: Api = {
  getVersion,
  greet: (name) => invoke('greet', { name }),
  create_keys: () => invoke('create_keys', {}),
  create_jwt_tokens: (claims) => invoke('create_jwt_token', { claims }),
  settingRead: (key, decoder) =>
    pipe(() => store.get(key), task.map(decoder.decode), task.map(option.fromEither)),
  settingWrite: (key, value) => () =>
    value != null
      ? store.set(key, value).then(() => store.save())
      : store.delete(key).then(() => store.save()),
  writeConfigFile: (name: string, value: string) => () =>
    writeTextFile(name, value, { dir: BaseDirectory.AppLocalData }),
  hasConfigFile: (name) => () => exists(name, { dir: BaseDirectory.AppLocalData }),
  logout: () => api.settingWrite('accessToken', null),
  //TODO how to switch to production during build??
  CXUrl: 'http://localhost:3000',
  APIUrl: 'http://localhost:3100',
};
