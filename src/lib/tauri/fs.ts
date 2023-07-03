import { fs } from '@tauri-apps/api';
import { pipe, taskOption, tree } from '@code-expert/prelude';
import { FileEntryType } from '@/domain/File';

export const readDir = taskOption.tryCatchK(fs.readDir);
export const readBinaryFile = taskOption.tryCatchK(fs.readBinaryFile);
export const readTextFile = taskOption.tryCatchK(fs.readTextFile);
export const removeFile = taskOption.tryCatchK(fs.removeFile);

export const readDirTree = (
  dir: string,
): taskOption.TaskOption<tree.Tree<{ path: string; type: FileEntryType }>> =>
  pipe(
    readDir(dir, { recursive: true }),
    taskOption.map((files) =>
      tree.make<{ path: string; type: FileEntryType }>(
        { path: dir, type: 'dir' },
        tree.unfoldForest(files, ({ path, children }) => [
          { path, type: children == null ? 'file' : 'dir' },
          children ?? [],
        ]),
      ),
    ),
  );
