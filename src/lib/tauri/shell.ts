import { shell } from '@tauri-apps/api';
import { taskEither } from '@code-expert/prelude';
import { fromTauriError } from '@/lib/tauri/TauriException';

export const open = taskEither.tryCatchK(shell.open, fromTauriError);
