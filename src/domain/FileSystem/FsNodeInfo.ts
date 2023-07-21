import { api } from 'api';
import { constVoid, eq, iots, pipe, string, task, taskEither } from '@code-expert/prelude';
import { FsDir, FsFile, removeFile } from '@/lib/tauri/fs';
import { FsDirC, FsFileC } from './FsNode';
import { FileSystemStack } from './fileSystemStack';

export type FsDirInfo = FsDir;
export const FsDirInfoC: iots.Type<FsDir> = FsDirC;

export interface FsFileInfo extends FsFile {
  hash: string;
}
export const FsFileInfoC: iots.Type<FsFileInfo> = iots.intersection([
  FsFileC,
  iots.strict({ hash: iots.string }),
]);

export type FsNodeInfo = FsDirInfo | FsFileInfo;
export const FsNodeInfoC: iots.Type<FsNodeInfo> = iots.union([FsDirInfoC, FsFileInfoC]);

export const eqFsNodeInfo = eq.struct({
  type: string.Eq,
  path: string.Eq,
});

// -------------------------------------------------------------------------------------------------

export const fromFsFile =
  (stack: FileSystemStack, projectDir: string) =>
  <A extends FsFile>(file: A): task.Task<A & FsFileInfo> =>
    pipe(
      stack.join(projectDir, file.path),
      task.chain(api.getFileHash),
      taskEither.getOrElse((e) => {
        throw e;
      }),
      task.map((hash) => ({ ...file, hash })),
    );

export const deleteSingleFile =
  (stack: FileSystemStack, projectDir: string) =>
  (file: FsFile): task.Task<void> =>
    pipe(stack.join(projectDir, file.path), task.chainFirst(removeFile), task.map(constVoid));
