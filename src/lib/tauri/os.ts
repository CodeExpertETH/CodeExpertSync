import { os as tauriOs, path as tauriPath } from '@tauri-apps/api';
import { taskOption } from '@code-expert/prelude';

export const tempDir: taskOption.TaskOption<string> = taskOption.tryCatch(tauriOs.tempdir);

export const appLocalDataDir: taskOption.TaskOption<string> = taskOption.tryCatch(
  tauriPath.appLocalDataDir,
);
