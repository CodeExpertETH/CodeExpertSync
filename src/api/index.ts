import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { createDir, exists as fsExists, removeDir, writeTextFile } from '@tauri-apps/api/fs';
import { dirname } from '@tauri-apps/api/path';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import {
  constFalse,
  constVoid,
  flow,
  iots,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { Exception, fromError } from '@/domain/exception';
import { os, path } from '@/lib/tauri';
import { removeFile } from '@/lib/tauri/fs';

const store = new TauriStore('settings.json');

export interface Api {
  getVersion(): taskEither.TaskEither<Exception, string>;
  create_keys(): taskEither.TaskEither<Exception, string>;
  create_jwt_tokens(claims: Record<string, unknown>): taskEither.TaskEither<Exception, string>;
  buildTar(
    fileName: string,
    rootDir: string,
    files: Array<string>,
  ): taskEither.TaskEither<Exception, string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): taskOption.TaskOption<void>;
  writeFile(filePath: string, content: string): taskEither.TaskEither<Exception, void>;
  writeProjectFile(
    filePath: string,
    content: string,
    readOnly: boolean,
  ): taskEither.TaskEither<Exception, void>;
  removeDir(filePath: string): taskEither.TaskEither<Exception, void>;
  getFileHash(filePath: string): taskEither.TaskEither<Exception, string>;
  createProjectDir(filePath: string, readOnly: boolean): taskOption.TaskOption<void>;
  createProjectPath(filePath: string): taskOption.TaskOption<void>;
  exists(path: string): task.Task<boolean>;
  logout(): task.Task<void>;
  getSystemInfo: taskOption.TaskOption<string>;
}

export const api: Api = {
  getVersion: () => taskEither.tryCatch(() => getVersion(), fromError),
  create_keys: () => taskEither.tryCatch(() => invoke('create_keys', {}), fromError),
  create_jwt_tokens: (claims) =>
    taskEither.tryCatch(() => invoke('create_jwt_token', { claims }), fromError),
  buildTar: (fileName, rootDir, files) =>
    taskEither.tryCatch(() => invoke('build_tar', { fileName, rootDir, files }), fromError),
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
  createProjectPath: (path) =>
    pipe(
      api.settingRead('projectDir', iots.string),
      taskOption.chain((root) =>
        taskOption.tryCatch(() => invoke('create_project_path', { path, root })),
      ),
    ),
  createProjectDir: (path, readOnly) =>
    taskOption.tryCatch(() => invoke('create_project_dir', { path, readOnly })),
  writeProjectFile: (filePath, content, readOnly) =>
    taskEither.tryCatch(
      () =>
        invoke('write_file', {
          path: filePath,
          contents: Array.from(new TextEncoder().encode(content)),
          readOnly,
        }),
      fromError,
    ),
  logout: () =>
    pipe(
      os.appLocalDataDir(),
      taskEither.chain((dir) => path.join(dir, 'privateKey.pem')),
      taskEither.chain(removeFile),
      taskEither.match((error: Exception): void => {
        console.debug(
          `[logout] There were some errors while removing the private key:`,
          error.message,
        );
      }, constVoid),
    ),
  getSystemInfo: taskOption.tryCatch(() => invoke('system_info')),
};
