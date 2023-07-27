import { constVoid, iots, pipe, task } from '@code-expert/prelude';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { PfsPath, PfsPathC, ProjectPath } from './Path';

export interface FsDir {
  type: 'dir';
  path: PfsPath;
}

export interface FsFile {
  type: 'file';
  path: PfsPath;
}

export const FsDirC: iots.Type<FsDir> = iots.strict({
  type: iots.literal('dir'),
  path: PfsPathC,
});

export const FsFileC: iots.Type<FsFile> = iots.strict({
  type: iots.literal('file'),
  path: PfsPathC,
});

// -------------------------------------------------------------------------------------------------

export const deleteSingleFile =
  (stack: FileSystemStack, projectDir: ProjectPath) =>
  (file: FsFile): task.Task<void> =>
    pipe(stack.join(projectDir, file.path), task.chainFirst(stack.removeFile), task.map(constVoid));
