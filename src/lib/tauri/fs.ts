import { fs } from '@tauri-apps/api';
import { pipe, task, taskEither, tree } from '@code-expert/prelude';
import { FileEntry } from '@/domain/File';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const readDir = taskEither.tryCatchK(fs.readDir, fromTauriError);
export const readBinaryFile = taskEither.tryCatchK(fs.readBinaryFile, fromTauriError);
export const readTextFile = taskEither.tryCatchK(fs.readTextFile, fromTauriError);
export const removeFile = taskEither.tryCatchK(fs.removeFile, fromTauriError);
export const exists =
  (path: string): task.Task<boolean> =>
  () =>
    fs.exists(path);

export const readDirTree = (
  dir: string,
): taskEither.TaskEither<TauriException, tree.Tree<FileEntry>> =>
  pipe(
    readDir(dir, { recursive: true }),
    taskEither.map((files) =>
      tree.make<FileEntry>(
        { path: dir, type: 'dir' },
        tree.unfoldForest(files, ({ path, children }) => [
          { path, type: children == null ? 'file' : 'dir' },
          children ?? [],
        ]),
      ),
    ),
  );
