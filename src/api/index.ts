import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { createDir, exists as fsExists, removeDir, writeTextFile } from '@tauri-apps/api/fs';
import { dirname } from '@tauri-apps/api/path';
import { relaunch } from '@tauri-apps/api/process';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import {
  constFalse,
  constVoid,
  flow,
  iots,
  option,
  pipe,
  task,
  taskOption,
} from '@code-expert/prelude';
import { os, path } from '@/lib/tauri';
import { removeFile } from '@/lib/tauri/fs';

const store = new TauriStore('settings.json');

export interface Api {
  getVersion: task.Task<string>;
  create_keys: task.Task<string>;
  create_jwt_tokens(claims: Record<string, unknown>): task.Task<string>;
  buildTar(fileName: string, rootDir: string, files: Array<string>): task.Task<string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): taskOption.TaskOption<void>;
  writeFile(filePath: string, content: string): task.Task<void>;
  writeProjectFile(filePath: string, content: string, readOnly: boolean): task.Task<void>;
  removeDir(filePath: string): taskOption.TaskOption<void>;
  getFileHash(filePath: string): task.Task<string>;
  createProjectDir(filePath: string, readOnly: boolean): taskOption.TaskOption<void>;
  createProjectPath(filePath: string): taskOption.TaskOption<void>;
  exists(path: string): task.Task<boolean>;
  logout(): task.Task<void>;
  getSystemInfo: taskOption.TaskOption<string>;
  restart: task.Task<void>;
}

export const api: Api = {
  getVersion,
  create_keys: () => invoke('create_keys', {}),
  create_jwt_tokens: (claims) => () => invoke('create_jwt_token', { claims }),
  buildTar: (fileName, rootDir, files) => () => invoke('build_tar', { fileName, rootDir, files }),
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
  writeFile: (filePath, content) => async () => {
    const dir = await dirname(filePath);
    if (!(await fsExists(dir))) {
      await createDir(dir, { recursive: true });
    }
    return writeTextFile(filePath, content);
  },
  removeDir: (filePath) => taskOption.tryCatch(() => removeDir(filePath, { recursive: true })),
  getFileHash: (path) => () => invoke('get_file_hash', { path }),
  createProjectPath: (path) =>
    pipe(
      api.settingRead('projectDir', iots.string),
      taskOption.chain((root) =>
        taskOption.tryCatch(() => invoke('create_project_path', { path, root })),
      ),
    ),
  createProjectDir: (path, readOnly) =>
    taskOption.tryCatch(() => invoke('create_project_dir', { path, readOnly })),
  writeProjectFile: (filePath, content, readOnly) => () =>
    invoke('write_file', {
      path: filePath,
      contents: Array.from(new TextEncoder().encode(content)),
      readOnly,
    }),
  logout: () =>
    pipe(
      os.appLocalDataDir,
      taskOption.chainTaskK((dir) => path.join(dir, 'privateKey.pem')),
      taskOption.chain(removeFile),
      taskOption.match(() => {
        console.debug(`[logout] The private key could not be removed cleanly`);
      }, constVoid),
    ),
  getSystemInfo: async () => option.fromNullable<string>(await invoke('system_info')),
  restart: () => relaunch(),
};
