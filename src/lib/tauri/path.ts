import { tauri, path as tauriPath } from '@tauri-apps/api';
import { taskEither } from '@code-expert/prelude';
import { fromError } from '@/domain/exception';

export const basename = taskEither.tryCatchK(tauriPath.basename, fromError);
/**
 * Note: passing '.' or '/' will result in either.left(PathError("Couldn't get the parent directory"))
 */
export const dirname = taskEither.tryCatchK(tauriPath.dirname, fromError);
export const extname = taskEither.tryCatchK(tauriPath.extname, fromError);
export const isAbsolute = taskEither.tryCatchK(tauriPath.isAbsolute, fromError);
export const join = taskEither.tryCatchK(tauriPath.join, fromError);
export const normalize = taskEither.tryCatchK(tauriPath.normalize, fromError);
export const resolve = taskEither.tryCatchK(tauriPath.resolve, fromError);

// export const relative = taskEither.tryCatchK(
//   (from: string, to: string) => tauri.invoke<string>('path_relative', { from, to }),
//   fromError,
// );

export const stripAncestor = (ancestor: string) =>
  taskEither.tryCatchK(
    (to: string) =>
      tauri.invoke<string>('path_remove_ancestor', {
        ancestor,
        to,
      }),
    fromError,
  );

export const escape = (path: string) => path.replace(/[^a-z0-9_-]/gi, '_');
