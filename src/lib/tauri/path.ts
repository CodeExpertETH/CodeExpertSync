import { tauri, path as tauriPath } from '@tauri-apps/api';
import {
  array,
  either,
  flow,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { NativePath, Path, PathSegmentC, isoNativePath } from '@/domain/FileSystem';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const basename = flow(isoNativePath.unwrap, taskOption.tryCatchK(tauriPath.basename));

/**
 * Note: passing '', '.', or '/' will result in either.left(PathError("Couldn't get the parent directory"))
 */
export const dirname = flow(
  isoNativePath.unwrap,
  taskEither.tryCatchK(tauriPath.dirname, fromTauriError),
);

export const extname = taskEither.tryCatchK(tauriPath.extname, fromTauriError);
export const isAbsolute = task.fromPromiseK(tauriPath.isAbsolute);

export const append =
  (relative: Path) =>
  (base: NativePath): taskEither.TaskEither<TauriException, NativePath> =>
    pipe(
      toNativePath(relative),
      taskEither.chainTaskK(
        (path) => () => tauriPath.join(isoNativePath.unwrap(base), isoNativePath.unwrap(path)),
      ),
      taskEither.map(isoNativePath.wrap),
    );

export const normalize = task.fromPromiseK(tauriPath.normalize);
export const resolve = task.fromPromiseK(tauriPath.resolve);

export const stripAncestor =
  (ancestor: NativePath) =>
  (path: NativePath): taskEither.TaskEither<TauriException, NativePath> =>
    pipe(
      taskEither.tryCatch(
        () =>
          tauri.invoke<string>('path_remove_ancestor', {
            ancestor: isoNativePath.unwrap(ancestor),
            to: isoNativePath.unwrap(path),
          }),
        fromTauriError,
      ),
      taskEither.map(isoNativePath.wrap),
    );

const fromComponents: (components: Array<string>) => option.Option<Path> = flow(
  array.dropLeftWhile((s) => s === '/' || s === '.' || s === '\\' || s === '\\\\'),
  array.traverse(either.Applicative)(PathSegmentC.decode),
  option.fromEither,
);

/**
 * Parses a native OS path to an abstract path.
 */
export const parseNativePath: (
  path: NativePath,
) => taskEither.TaskEither<TauriException, option.Option<Path>> = flow(
  isoNativePath.unwrap,
  taskEither.tryCatchK(
    (path) => tauri.invoke<Array<string>>('path_parse_relative_path', { path }),
    fromTauriError,
  ),
  taskEither.map(fromComponents),
);

/**
 * Serialises an abstract path into a native OS path.
 */
export const toNativePath: (path: Path) => taskEither.TaskEither<TauriException, NativePath> = flow(
  taskEither.tryCatchK(
    (path) => tauri.invoke<string>('path_to_native_path', { path }),
    fromTauriError,
  ),
  taskEither.map(isoNativePath.wrap),
);
