import { iots } from '@code-expert/prelude';
import { HashInfo, HashInfoC, hashInfoFromFsFile } from './HashInfo';
import { PfsInfo, PfsInfoC } from './PfsInfo';
import { PfsFile, PfsFileC } from './PfsNode';

export interface PersistedFileInfo extends PfsFile, HashInfo, PfsInfo {}

type StoredPersistedFileInfo = Omit<PersistedFileInfo, 'path'> & { path: string };

export const PersistedFileInfoC: iots.Type<PersistedFileInfo, StoredPersistedFileInfo> =
  iots.intersection([PfsFileC, HashInfoC, PfsInfoC]);

// -------------------------------------------------------------------------------------------------

export const fromRemoteFileInfo = hashInfoFromFsFile;
