import { iots, pipe, task } from '@code-expert/prelude';
import { PfsFile } from './PfsNode';
import { ProjectDir, projectEntryToNativePath } from './ProjectDir';
import { FileSystemStack } from './fileSystemStack';

export const HashInfoC = iots.strict({ hash: iots.string });

export interface HashInfo {
  hash: string;
}

export const hashInfoFromFsFile =
  (stack: FileSystemStack) =>
  (projectDir: ProjectDir) =>
  <A extends PfsFile>(file: A): task.Task<A & HashInfo> =>
    pipe(
      projectEntryToNativePath(stack)(projectDir, file.path),
      task.chain(stack.getFileHash),
      task.map((hash) => ({ ...file, hash })),
    );
