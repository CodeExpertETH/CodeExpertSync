import { iots } from '@code-expert/prelude';
import { FsDir, FsDirC, FsFile, FsFileC } from './FsNode';
import { PfsInfo, PfsInfoC } from './PfsInfo';

// -------------------------------------------------------------------------------------------------
// Codecs to convert between the API representation and the internal cxsync representation
// -------------------------------------------------------------------------------------------------

export interface RemoteDirInfo extends FsDir, PfsInfo {}
export const RemoteDirInfoC = iots.intersection([FsDirC, PfsInfoC]);

export interface RemoteFileInfo extends FsFile, PfsInfo {}
export const RemoteFileInfoC = iots.intersection([FsFileC, PfsInfoC]);

export type RemoteNodeInfo = RemoteDirInfo | RemoteFileInfo;
export const RemoteNodeInfoC = iots.union([RemoteDirInfoC, RemoteFileInfoC]);
