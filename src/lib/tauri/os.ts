import { os as tauriOs } from '@tauri-apps/api';
import { taskEither } from '@code-expert/prelude';
import { fromError } from '@/domain/exception';

export const tempDir = taskEither.tryCatchK(tauriOs.tempdir, fromError);
