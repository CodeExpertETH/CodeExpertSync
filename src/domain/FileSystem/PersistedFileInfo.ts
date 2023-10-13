import { iots } from '@code-expert/prelude';
import { FsFile, FsFileC } from './FsNode';
import { HashInfo, HashInfoC, hashInfoFromFsFile } from './HashInfo';
import { PfsInfo, PfsInfoC } from './PfsInfo';

export interface PersistedFileInfo extends FsFile, HashInfo, PfsInfo {}

type StoredPersistedFileInfo = Omit<PersistedFileInfo, 'path'> & { path: string };

export const PersistedFileInfoC: iots.Type<PersistedFileInfo, StoredPersistedFileInfo> =
  iots.intersection([FsFileC, HashInfoC, PfsInfoC]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo = hashInfoFromFsFile;
