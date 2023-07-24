import { iots, pipe, task } from '@code-expert/prelude';
import { LocalFileInfo, LocalFileInfoC, localFileInfoFromFsFile } from './LocalNodeInfo';
import { PfsInfo, PfsInfoC } from './PfsInfo';
import { RemoteFileInfo } from './RemoteNodeInfo';
import { FileSystemStack } from './fileSystemStack';

export interface PersistedFileInfo extends LocalFileInfo, PfsInfo {}
export const PersistedFileInfoC: iots.Type<PersistedFileInfo> = iots.intersection([
  LocalFileInfoC,
  PfsInfoC,
]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo =
  (stack: FileSystemStack, projectDir: string) =>
  (file: RemoteFileInfo): task.Task<PersistedFileInfo> =>
    pipe(file, localFileInfoFromFsFile(stack, projectDir));
