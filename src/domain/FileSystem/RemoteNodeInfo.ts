import { iots } from '@code-expert/prelude';
import { FsDir, FsDirC, FsFile, FsFileC } from './FsNode';
import { PfsInfo, PfsInfoC } from './PfsInfo';

export interface RemoteDirInfo extends FsDir, PfsInfo {}
export const RemoteDirInfoC: iots.Type<RemoteDirInfo> = iots.intersection([FsDirC, PfsInfoC]);

export interface RemoteFileInfo extends FsFile, PfsInfo {}
export const RemoteFileInfoC: iots.Type<RemoteFileInfo> = iots.intersection([FsFileC, PfsInfoC]);

export type RemoteNodeInfo = RemoteDirInfo | RemoteFileInfo;
export const RemoteNodeInfoC: iots.Type<RemoteNodeInfo> = iots.union([
  RemoteDirInfoC,
  RemoteFileInfoC,
]);
