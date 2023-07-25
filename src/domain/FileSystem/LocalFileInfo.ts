import { constVoid, iots, pipe, task } from '@code-expert/prelude';
import { FsFile, FsFileC } from './FsNode';
import { HashInfo, HashInfoC } from './HashInfo';
import { FileSystemStack } from './fileSystemStack';

export interface LocalFileInfo extends FsFile, HashInfo {}
export const LocalFileInfoC: iots.Type<LocalFileInfo> = iots.intersection([FsFileC, HashInfoC]);

// -------------------------------------------------------------------------------------------------

export const deleteSingleFile =
  (stack: FileSystemStack, projectDir: string) =>
  (file: FsFile): task.Task<void> =>
    pipe(stack.join(projectDir, file.path), task.chainFirst(stack.removeFile), task.map(constVoid));
