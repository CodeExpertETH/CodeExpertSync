import { iots, option, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { dirname } from '@tauri-apps/api/path';
import { Store as TauriStore } from 'tauri-plugin-store-api';

import { Exception, InvariantViolation, fromError } from '../domain/exception';

const store = new TauriStore('.settings.dat');

export interface Api {
  getVersion(): Promise<string>;
  greet(name: string): Promise<string>;
  create_keys(): Promise<string>;
  create_jwt_tokens(claims: Record<string, unknown>): Promise<string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): task.Task<void>;
  writeConfigFile(name: string, value: Record<string, unknown>): task.Task<void>;
  writeFile(filePath: string, content: string): taskEither.TaskEither<Exception, void>;
  readConfigFile<T>(name: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
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
  writeFile: (filePath, content) =>
    pipe(
      filePath,
      taskEither.fromNullable(new InvariantViolation('filePath is null')),
      taskEither.chainFirst((filePath) =>
        taskEither.tryCatch(async () => {
          const dir = await dirname(filePath);
          return createDir(dir);
        }, fromError),
      ),
      taskEither.chain((filePath) =>
        taskEither.tryCatch(() => writeTextFile(filePath, content), fromError),
      ),
    ),
  writeConfigFile: (name, value) => () =>
    writeTextFile(name, JSON.stringify(value), { dir: BaseDirectory.AppLocalData }),
  readConfigFile: (name, decoder) =>
    pipe(
      () => readTextFile(name, { dir: BaseDirectory.AppLocalData }),
      task.map(JSON.parse),
      task.map(decoder.decode),
      task.map(option.fromEither),
    ),
  hasConfigFile: (name) => () => exists(name, { dir: BaseDirectory.AppLocalData }),
  logout: () => api.settingWrite('accessToken', null),
  //TODO how to switch to production during build??
  CXUrl: 'http://localhost:3000',
  APIUrl: 'http://localhost:3100',
};
