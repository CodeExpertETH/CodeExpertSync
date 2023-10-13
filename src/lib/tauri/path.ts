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
  (base: NativePath): task.Task<NativePath> =>
    pipe(
      toNativePath(relative),
      task.chain(
        (path) => () => tauriPath.join(isoNativePath.unwrap(base), isoNativePath.unwrap(path)),
      ),
      task.map(isoNativePath.wrap),
    );

export const normalize = task.fromPromiseK(tauriPath.normalize);
export const resolve = task.fromPromiseK(tauriPath.resolve);

// TODO: would be nice to have a pure TS implementation. See Rust's Path::strip_ancestor docs for a rudimentary unit test suite
export const stripAncestor =
  (ancestor: NativePath) =>
  (path: NativePath): taskEither.TaskEither<TauriException, NativePath> =>
    pipe(
      () =>
        tauri.invoke<either.Either<string, string>>('path_remove_ancestor', {
          ancestor: isoNativePath.unwrap(ancestor),
          to: isoNativePath.unwrap(path),
        }),

      taskEither.bimap(fromTauriError, isoNativePath.wrap),
    );

const fromComponents: (components: Array<string>) => option.Option<Path> = flow(
  array.dropLeftWhile((s) => s === '/' || s === '.' || s === '\\' || s === '\\\\'),
  array.traverse(either.Applicative)(PathSegmentC.decode),
  option.fromEither,
);

/**
 * Parses a native OS path to an abstract path.
 */
export const parsePath: (path: NativePath) => task.Task<option.Option<Path>> = flow(
  isoNativePath.unwrap,
  (path) => () => tauri.invoke<Array<string>>('path_parse_relative_path', { path }),
  task.map(fromComponents),
);

/**
 * Serialises an abstract path into a native OS path.
 */
export const toNativePath: (path: Path) => task.Task<NativePath> = (path) =>
  pipe(() => tauri.invoke<string>('path_to_native_path', { path }), task.map(isoNativePath.wrap));
