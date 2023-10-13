import { open } from '@tauri-apps/api/shell';
import { flow, taskEither } from '@code-expert/prelude';
import { NativePath, isoNativePath } from '@/domain/FileSystem';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const openFileBrowser: (path: NativePath) => taskEither.TaskEither<TauriException, void> =
  taskEither.tryCatchK(flow(isoNativePath.unwrap, open), fromTauriError);

export const openWebBrowser: (path: string) => taskEither.TaskEither<TauriException, void> =
  taskEither.tryCatchK(open, fromTauriError);
