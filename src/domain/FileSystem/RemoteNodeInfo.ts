import { iots } from '@code-expert/prelude';
import { PfsInfo, PfsInfoC } from './PfsInfo';
import { PfsDir, PfsDirC, PfsFile, PfsFileC } from './PfsNode';

// -------------------------------------------------------------------------------------------------
// Codecs to convert between the API representation and the internal cxsync representation
// -------------------------------------------------------------------------------------------------

export interface RemoteDirInfo extends PfsDir, PfsInfo {}
export const RemoteDirInfoC = iots.intersection([PfsDirC, PfsInfoC]);

export interface RemoteFileInfo extends PfsFile, PfsInfo {}
export const RemoteFileInfoC = iots.intersection([PfsFileC, PfsInfoC]);

export type RemoteNodeInfo = RemoteDirInfo | RemoteFileInfo;
export const RemoteNodeInfoC = iots.union([RemoteDirInfoC, RemoteFileInfoC]);
