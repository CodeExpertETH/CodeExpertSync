import { iots, pipe, task } from '@code-expert/prelude';
import { FsFileInfo, FsFileInfoC, fromFsFile } from './FsNodeInfo';
import { PfsInfo, PfsInfoC } from './PfsInfo';
import { RemoteFileInfo } from './RemoteNodeInfo';
import { FileSystemStack } from './fileSystemStack';

export interface FileInfo extends FsFileInfo, PfsInfo {}
export const FileInfoC: iots.Type<FileInfo> = iots.intersection([FsFileInfoC, PfsInfoC]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo =
  (stack: FileSystemStack, projectDir: string) =>
  (file: RemoteFileInfo): task.Task<FileInfo> =>
    pipe(file, fromFsFile(stack, projectDir));
