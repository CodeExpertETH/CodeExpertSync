import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { removeDir } from '@tauri-apps/api/fs';
import { relaunch } from '@tauri-apps/api/process';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import {
  constVoid,
  either,
  iots,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { PfsPath, ProjectPath } from '@/domain/FileSystem';
import { os, path } from '@/lib/tauri';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';
import { removeFile } from '@/lib/tauri/fs';
import { panic } from '@/utils/error';

const store = new TauriStore('settings.json');

export interface Api {
  getVersion: task.Task<string>;
  create_keys: task.Task<string>;
  create_jwt_tokens(claims: Record<string, unknown>): taskEither.TaskEither<string, string>;
  buildTar(fileName: string, rootDir: ProjectPath, files: Array<PfsPath>): task.Task<string>;
  settingRead<T>(key: string, decoder: iots.Decoder<unknown, T>): taskOption.TaskOption<T>;
  settingWrite(key: string, value: unknown): task.Task<void>;
  writeProjectFile(
    filePath: string,
    content: string,
    readOnly: boolean,
  ): taskEither.TaskEither<TauriException, void>;
  removeDir(filePath: string): taskEither.TaskEither<TauriException, void>;
  createProjectDir(
    filePath: string,
    readOnly: boolean,
  ): taskEither.TaskEither<TauriException, void>;
  createProjectPath(filePath: string): taskEither.TaskEither<TauriException, void>;
  logout(): task.Task<void>;
  getSystemInfo: taskOption.TaskOption<string>;
  restart: task.Task<void>;
}

export const api: Api = {
  getVersion,
  create_keys: () => invoke('create_keys', {}),
  create_jwt_tokens: (claims) =>
    pipe(
      () => invoke<AlmostEither>('create_jwt_token', { claims }),
      task.map((ae) => (ae._tag === 'Left' ? either.left(ae.value) : either.right(ae.value))),
    ),
  buildTar: (fileName, rootDir, files) => () => invoke('build_tar', { fileName, rootDir, files }),
  settingRead: (key, decoder) =>
    pipe(() => store.get(key), task.map(decoder.decode), taskOption.fromTaskEither),
  settingWrite: (key, value) => () =>
    value != null
      ? store.set(key, value).then(() => store.save())
      : store.delete(key).then(() => store.save()),
  removeDir: (filePath) =>
    taskEither.tryCatch(() => removeDir(filePath, { recursive: true }), fromTauriError),
  createProjectPath: (path) =>
    pipe(
      api.settingRead('projectDir', iots.string),
      taskOption.getOrElse(() => panic('Could not find project dir')),
      task.chain((root) =>
        taskEither.tryCatch(() => invoke('create_project_path', { path, root }), fromTauriError),
      ),
    ),
  createProjectDir: (path, readOnly) =>
    taskEither.tryCatch(() => invoke('create_project_dir', { path, readOnly }), fromTauriError),
  writeProjectFile: (filePath, content, readOnly) =>
    taskEither.tryCatch(
      () =>
        invoke('write_file', {
          path: filePath,
          contents: Array.from(new TextEncoder().encode(content)),
          readOnly,
        }),
      fromTauriError,
    ),
  logout: () =>
    pipe(
      os.appLocalDataDir,
      taskEither.chainTaskK((dir) => path.join(dir, 'privateKey.pem')),
      taskEither.chain(removeFile),
      taskEither.match((e) => {
        console.debug(`[logout] The private key could not be removed cleanly: ${e.message}`);
      }, constVoid),
    ),
  getSystemInfo: async () => option.fromNullable<string>(await invoke('system_info')),
  restart: () => relaunch(),
};

interface AlmostEither {
  _tag: 'Left' | 'Right';
  value: string;
}
