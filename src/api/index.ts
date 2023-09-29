import { invoke } from '@tauri-apps/api';
import { getVersion } from '@tauri-apps/api/app';
import { removeDir } from '@tauri-apps/api/fs';
import { relaunch } from '@tauri-apps/api/process';
import { Store as TauriStore } from 'tauri-plugin-store-api';
import {
  array,
  constVoid,
  either,
  iots,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { NativePath, PfsPath, isoNativePath, pfsPathToRelativePath } from '@/domain/FileSystem';
import { os, path } from '@/lib/tauri';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';
import { buildTar } from '@/lib/tauri/buildTar';
import { removeFile } from '@/lib/tauri/fs';

const store = new TauriStore('settings.json');

export interface Api {
  getVersion: task.Task<string>;
  create_keys: task.Task<string>;
  create_jwt_tokens: (claims: Record<string, unknown>) => taskEither.TaskEither<string, string>;
  buildTar: (
    tarFile: NativePath,
    rootDir: NativePath,
    files: Array<PfsPath>,
  ) => taskEither.TaskEither<TauriException, string>;
  settingRead: <T>(key: string, decoder: iots.Decoder<unknown, T>) => taskOption.TaskOption<T>;
  settingWrite: (key: string, value: unknown) => task.Task<void>;
  removeDir: (filePath: NativePath) => taskEither.TaskEither<TauriException, void>;
  logout: () => task.Task<void>;
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

  buildTar: (tarFile, rootDir, files) =>
    pipe(
      pipe(files, array.map(pfsPathToRelativePath), taskEither.traverseArray(path.toNativePath)),
      taskEither.chain((files) => buildTar({ tarFile, rootDir, files })),
    ),

  settingRead: (key, decoder) =>
    pipe(() => store.get(key), task.map(decoder.decode), taskOption.fromTaskEither),
  settingWrite: (key, value) => () =>
    value != null
      ? store.set(key, value).then(() => store.save())
      : store.delete(key).then(() => store.save()),

  removeDir: (filePath) =>
    taskEither.tryCatch(
      () => removeDir(isoNativePath.unwrap(filePath), { recursive: true }),
      fromTauriError,
    ),

  logout: () =>
    pipe(
      os.appLocalDataDir,
      taskEither.chain(path.append([iots.brandFromLiteral('privateKey.pem')])),
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
