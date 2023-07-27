import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { FsFile } from '@/domain/FileSystem/FsNode';
import { ProjectPath } from '@/domain/FileSystem/Path';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';

export const HashInfoC = iots.strict({ hash: iots.string });

export interface HashInfo {
  hash: string;
}

export const hashInfoFromFsFile =
  (stack: FileSystemStack, projectDir: ProjectPath) =>
  <A extends FsFile>(file: A): task.Task<A & HashInfo> =>
    pipe(
      stack.join(projectDir, file.path),
      task.chain(stack.getFileHash),
      taskEither.getOrElse((e) => {
        throw e;
      }),
      task.map((hash) => ({ ...file, hash })),
    );
