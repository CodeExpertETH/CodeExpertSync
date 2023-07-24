import { iots, pipe, task } from '@code-expert/prelude';
import { FsFile, FsFileC } from './FsNode';
import { HashInfo, HashInfoC, localFileInfoFromFsFile } from './HashInfo';
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
  (stack: FileSystemStack, projectDir: string) =>
  (file: RemoteFileInfo): task.Task<PersistedFileInfo> =>
    pipe(file, localFileInfoFromFsFile(stack, projectDir));
