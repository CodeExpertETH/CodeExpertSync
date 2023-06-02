import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { createDir, exists as fsExists, removeDir, writeTextFile } from '@tauri-apps/api/fs';
import { dirname } from '@tauri-apps/api/path';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import {
  constFalse,
  flow,
  iots,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { Exception, fromError } from '@/domain/exception';

const store = new TauriStore('settings.json');

export interface Api {
  getVersion(): taskEither.TaskEither<Exception, string>;
  create_keys(): taskEither.TaskEither<Exception, string>;
  create_jwt_tokens(claims: Record<string, unknown>): taskEither.TaskEither<Exception, string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): taskOption.TaskOption<void>;
  writeFile(filePath: string, content: string): taskEither.TaskEither<Exception, void>;
  removeDir(filePath: string): taskEither.TaskEither<Exception, void>;
  getFileHash(filePath: string): taskEither.TaskEither<Exception, string>;
  createProjectDir(filePath: string): taskEither.TaskEither<Exception, void>;
  exists(path: string): task.Task<boolean>;
  logout(): taskOption.TaskOption<void>;
}

export const api: Api = {
  getVersion: () => taskEither.tryCatch(() => getVersion(), fromError),
  create_keys: () => taskEither.tryCatch(() => invoke('create_keys', {}), fromError),
  create_jwt_tokens: (claims) =>
    taskEither.tryCatch(() => invoke('create_jwt_token', { claims }), fromError),
  settingRead: (key, decoder) =>
    pipe(
      taskOption.tryCatch(() => store.get(key)),
      taskOption.chainOptionK(flow(decoder.decode, option.fromEither)),
    ),
  settingWrite: (key, value) =>
    taskOption.tryCatch(() =>
      value != null
        ? store.set(key, value).then(() => store.save())
        : store.delete(key).then(() => store.save()),
    ),
  exists(path: string) {
    return pipe(
      taskOption.tryCatch(() => fsExists(path)),
      taskOption.match(constFalse, (exists) => exists),
    );
  },
  writeFile: (filePath, content) =>
    pipe(
      taskEither.tryCatch(async () => {
        const dir = await dirname(filePath);
        if (!(await fsExists(dir))) {
          await createDir(dir, { recursive: true });
        }
      }, fromError),
      taskEither.chain(() =>
        taskEither.tryCatch(() => writeTextFile(filePath, content), fromError),
      ),
    ),
  removeDir: (filePath) =>
    taskEither.tryCatch(() => removeDir(filePath, { recursive: true }), fromError),
  getFileHash: (path) => taskEither.tryCatch(() => invoke('get_file_hash', { path }), fromError),
  createProjectDir: (path) =>
    taskEither.tryCatch(() => invoke('create_project_dir', { path }), fromError),
  logout: () => api.settingWrite('accessToken', null),
};
