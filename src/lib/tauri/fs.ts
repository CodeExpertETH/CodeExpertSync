import { fs, invoke } from '@tauri-apps/api';
import { FileEntry } from '@tauri-apps/api/fs';
import { pipe, task, taskEither, tree } from '@code-expert/prelude';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export interface FsDir {
  type: 'dir';
  path: string;
}

export interface FsFile {
  type: 'file';
  path: string;
}

export type FsNode = FsDir | FsFile;

export const isFile = <A extends FsNode>(a: A): a is Extract<A, FsFile> => a.type === 'file';
export const isDir = <A extends FsNode>(a: A): a is Extract<A, FsDir> => a.type === 'dir';

export const readDir = taskEither.tryCatchK(fs.readDir, fromTauriError);
export const readBinaryFile = taskEither.tryCatchK(fs.readBinaryFile, fromTauriError);
export const readTextFile = taskEither.tryCatchK(fs.readTextFile, fromTauriError);
export const removeFile = taskEither.tryCatchK(fs.removeFile, fromTauriError);
export const exists =
  (path: string): task.Task<boolean> =>
  () =>
    fs.exists(path);

export const readFsTree = (dir: string): taskEither.TaskEither<TauriException, tree.Tree<FsNode>> =>
  pipe(
    readDir(dir, { recursive: true }),
    taskEither.map((files) =>
      tree.make<FsNode>(
        { path: dir, type: 'dir' },
        tree.unfoldForest(files, (file) => [fromFileEntry(file), file.children ?? []]),
      ),
    ),
  );

export const getFileHash = (path: string): taskEither.TaskEither<TauriException, string> =>
  taskEither.tryCatch(() => invoke('get_file_hash', { path }), fromTauriError);

// -------------------------------------------------------------------------------------------------

const fromFileEntry = ({ path, children }: FileEntry): FsNode => ({
  path,
  type: children == null ? 'file' : 'dir',
});
