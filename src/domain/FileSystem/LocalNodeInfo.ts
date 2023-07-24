import { api } from 'api';
import { constVoid, eq, iots, pipe, string, task, taskEither } from '@code-expert/prelude';
import { FsDir, FsDirC, FsFile, FsFileC, removeFile } from './FsNode';
import { FileSystemStack } from './fileSystemStack';

export type LocalDirInfo = FsDir;
export const LocalDirInfoC: iots.Type<FsDir> = FsDirC;

export interface LocalFileInfo extends FsFile {
  hash: string;
}
export const LocalFileInfoC: iots.Type<LocalFileInfo> = iots.intersection([
  FsFileC,
  iots.strict({ hash: iots.string }),
]);

export type LocalNodeInfo = LocalDirInfo | LocalFileInfo;
export const LocalNodeInfoC: iots.Type<LocalNodeInfo> = iots.union([LocalDirInfoC, LocalFileInfoC]);

export const eqLocalNodeInfo = eq.struct({
  type: string.Eq,
  path: string.Eq,
});

// -------------------------------------------------------------------------------------------------

export const localFileInfoFromFsFile =
  (stack: FileSystemStack, projectDir: string) =>
  <A extends FsFile>(file: A): task.Task<A & LocalFileInfo> =>
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
