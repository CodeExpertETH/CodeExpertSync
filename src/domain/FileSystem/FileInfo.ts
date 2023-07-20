import { iots, pipe, task } from '@code-expert/prelude';
import { FsFileInfo, FsFileInfoC, fromFsFile } from '@/domain/FileSystem/FsNodeInfo';
import { PfsInfo, PfsInfoC } from '@/domain/FileSystem/PfsInfo';
import { RemoteFileInfo } from '@/domain/FileSystem/RemoteNodeInfo';
import { Stack } from './stack';

export interface FileInfo extends FsFileInfo, PfsInfo {}
export const FileInfoC: iots.Type<FileInfo> = iots.intersection([FsFileInfoC, PfsInfoC]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo =
  (stack: Stack, projectDir: string) =>
  (file: RemoteFileInfo): task.Task<FileInfo> =>
    pipe(file, fromFsFile(stack, projectDir));
