import { os as tauriOs, path as tauriPath } from '@tauri-apps/api';
import { taskEither } from '@code-expert/prelude';
import { fromError } from '@/domain/exception';

export const tempDir = taskEither.tryCatchK(tauriOs.tempdir, fromError);

export const appLocalDataDir = taskEither.tryCatchK(tauriPath.appLocalDataDir, fromError);
