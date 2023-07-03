import { tauri, path as tauriPath } from '@tauri-apps/api';
import { task, taskOption } from '@code-expert/prelude';

export const basename = taskOption.tryCatchK(tauriPath.basename);
/**
 * Note: passing '.' or '/' will result in either.left(PathError("Couldn't get the parent directory"))
 */
export const dirname = taskOption.tryCatchK(tauriPath.dirname);
export const extname = taskOption.tryCatchK(tauriPath.extname);
export const isAbsolute = task.fromPromiseK(tauriPath.isAbsolute);
export const join = task.fromPromiseK(tauriPath.join);
export const normalize = task.fromPromiseK(tauriPath.normalize);
export const resolve = task.fromPromiseK(tauriPath.resolve);

// export const relative = taskEither.tryCatchK(
//   (from: string, to: string) => tauri.invoke<string>('path_relative', { from, to }),
//   fromError,
// );

export const stripAncestor = (ancestor: string) =>
  taskOption.tryCatchK((to: string) =>
    tauri.invoke<string>('path_remove_ancestor', {
      ancestor,
      to,
    }),
  );

export const escape = (path: string): string => path.replace(/[^a-z0-9_-]/gi, '_');
