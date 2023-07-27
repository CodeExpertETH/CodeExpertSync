import { iots, pipe, task } from '@code-expert/prelude';
import { ProjectPath } from '@/domain/FileSystem/Path';
import { FsFile, FsFileC } from './FsNode';
import { HashInfo, HashInfoC, hashInfoFromFsFile } from './HashInfo';
import { PfsInfo, PfsInfoC } from './PfsInfo';
import { RemoteFileInfo } from './RemoteNodeInfo';
import { FileSystemStack } from './fileSystemStack';

export interface PersistedFileInfo extends FsFile, HashInfo, PfsInfo {}
export const PersistedFileInfoC: iots.Type<PersistedFileInfo> = iots.intersection([
  FsFileC,
  HashInfoC,
  PfsInfoC,
]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo =
  (stack: FileSystemStack, projectDir: ProjectPath) =>
  (file: RemoteFileInfo): task.Task<PersistedFileInfo> =>
    pipe(file, hashInfoFromFsFile(stack, projectDir));
