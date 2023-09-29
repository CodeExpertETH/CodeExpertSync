import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { FsFile } from './FsNode';
import { ProjectDir, projectEntryToNativePath } from './ProjectDir';
import { FileSystemStack } from './fileSystemStack';

export const HashInfoC = iots.strict({ hash: iots.string });

export interface HashInfo {
  hash: string;
}

export const hashInfoFromFsFile =
  (stack: FileSystemStack) =>
  (projectDir: ProjectDir) =>
  <A extends FsFile>(file: A): task.Task<A & HashInfo> =>
    pipe(
      projectEntryToNativePath(stack)(projectDir, file.path),
      taskEither.chain(stack.getFileHash),
      taskEither.getOrElse((e) => {
        throw e;
      }),
      task.map((hash) => ({ ...file, hash })),
    );
