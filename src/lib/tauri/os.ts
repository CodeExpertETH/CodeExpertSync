import { os as tauriOs, path as tauriPath } from '@tauri-apps/api';
import { pipe, taskEither } from '@code-expert/prelude';
import { NativePath, isoNativePath } from '@/domain/FileSystem/NativePath';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const tempDir: taskEither.TaskEither<TauriException, NativePath> = pipe(
  taskEither.tryCatch(tauriOs.tempdir, fromTauriError),
  taskEither.map(isoNativePath.wrap),
);

export const appLocalDataDir: taskEither.TaskEither<TauriException, NativePath> = pipe(
  taskEither.tryCatch(tauriPath.appLocalDataDir, fromTauriError),
  taskEither.map(isoNativePath.wrap),
);
