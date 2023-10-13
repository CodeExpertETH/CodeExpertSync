import { fs, invoke } from '@tauri-apps/api';
import { BinaryFileContents, FileEntry, FsDirOptions, FsOptions } from '@tauri-apps/api/fs';
import { either, flow, pipe, task, taskEither, tree } from '@code-expert/prelude';
import { NativePath, isoNativePath } from '@/domain/FileSystem/NativePath';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

interface DirNode {
  type: 'dir';
}

interface FileNode {
  type: 'file';
}

type Node = DirNode | FileNode;

interface FsDir extends DirNode {
  path: NativePath;
}

interface FsFile extends FileNode {
  path: NativePath;
}

export type FsNode = FsDir | FsFile;

export const isFile = <A extends Node>(a: A): a is Extract<A, FileNode> => a.type === 'file';

export const readDir = (path: NativePath, options?: FsDirOptions) =>
  taskEither.tryCatch(() => fs.readDir(isoNativePath.unwrap(path), options), fromTauriError);

export const readBinaryFile = flow(
  isoNativePath.unwrap,
  taskEither.tryCatchK(fs.readBinaryFile, fromTauriError),
);

export const readTextFile = flow(
  isoNativePath.unwrap,
  taskEither.tryCatchK(fs.readTextFile, fromTauriError),
);

export const removeFile = (path: NativePath, options?: FsOptions) =>
  taskEither.tryCatch(() => fs.removeFile(isoNativePath.unwrap(path), options), fromTauriError);

export const exists =
  (path: NativePath): task.Task<boolean> =>
  () =>
    fs.exists(isoNativePath.unwrap(path));
export const writeTextFile = taskEither.tryCatchK<
  TauriException,
  [path: string, contents: string],
  void
>(fs.writeTextFile, fromTauriError);
export const writeBinaryFile = taskEither.tryCatchK<
  TauriException,
  [path: string, contents: BinaryFileContents],
  void
>(fs.writeBinaryFile, fromTauriError);
export const createDir = taskEither.tryCatchK(fs.createDir, fromTauriError);

export const readFsTree = (
  dir: NativePath,
): taskEither.TaskEither<TauriException, tree.Tree<FsNode>> =>
  pipe(
    readDir(dir, { recursive: true }),
    taskEither.map((files) =>
      tree.make<FsNode>(
        { path: dir, type: 'dir' },
        tree.unfoldForest(files, (file) => [fromFileEntry(file), file.children ?? []]),
      ),
    ),
  );

export const getFileHash: (path: NativePath) => task.Task<string> = (path) => () =>
  invoke('get_file_hash', { path: isoNativePath.unwrap(path) });

export const writeFileWithAncestors = (
  file: NativePath,
  content: Uint8Array,
): taskEither.TaskEither<TauriException, void> =>
  pipe(
    () =>
      invoke<either.Either<string, void>>('write_file_ancestors', {
        file: isoNativePath.unwrap(file),
        content: Array.from(content),
      }),
    taskEither.mapLeft(fromTauriError),
  );

// -------------------------------------------------------------------------------------------------

const fromFileEntry = ({ path, children }: FileEntry): FsNode => ({
  path: isoNativePath.wrap(path),
  type: children == null ? 'file' : 'dir',
});
