import { os as tauriOs, path as tauriPath } from '@tauri-apps/api';
import { taskEither } from '@code-expert/prelude';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const tempDir: taskEither.TaskEither<TauriException, string> = taskEither.tryCatch(
  tauriOs.tempdir,
  fromTauriError,
);

export const appLocalDataDir: taskEither.TaskEither<TauriException, string> = taskEither.tryCatch(
  tauriPath.appLocalDataDir,
  fromTauriError,
);
