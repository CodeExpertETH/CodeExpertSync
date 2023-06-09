import { fs } from '@tauri-apps/api';
import { pipe, taskEither, tree } from '@code-expert/prelude';
import { FileEntryType } from '@/domain/File';
import { fromError } from '@/domain/exception';

export const readDir = taskEither.tryCatchK(fs.readDir, fromError);
export const readBinaryFile = taskEither.tryCatchK(fs.readBinaryFile, fromError);
export const readTextFile = taskEither.tryCatchK(fs.readTextFile, fromError);
export const removeFile = taskEither.tryCatchK(fs.removeFile, fromError);

export const readDirTree = (dir: string) =>
  pipe(
    readDir(dir, { recursive: true }),
    taskEither.map((files) =>
      tree.make<{ path: string; type: FileEntryType }>(
        { path: dir, type: 'dir' },
        tree.unfoldForest(files, ({ path, children }) => [
          { path, type: children == null ? 'file' : 'dir' },
          children ?? [],
        ]),
      ),
    ),
  );
