import { iots } from '@code-expert/prelude';
import { PfsInfo, PfsInfoC } from '@/domain/FileSystem/PfsInfo';
import { FsDir, FsFile } from '@/lib/tauri/fs';

export const FsDirC: iots.Type<FsDir> = iots.strict({
  type: iots.literal('dir'),
  path: iots.string,
});

export const FsFileC: iots.Type<FsFile> = iots.strict({
  type: iots.literal('file'),
  path: iots.string,
});

export interface RemoteDirInfo extends FsDir, PfsInfo {}
export const RemoteDirInfoC: iots.Type<RemoteDirInfo> = iots.intersection([FsDirC, PfsInfoC]);

export interface RemoteFileInfo extends FsFile, PfsInfo {}
export const RemoteFileInfoC: iots.Type<RemoteFileInfo> = iots.intersection([FsFileC, PfsInfoC]);

export type RemoteNodeInfo = RemoteDirInfo | RemoteFileInfo;
export const RemoteNodeInfoC: iots.Type<RemoteNodeInfo> = iots.union([
  RemoteDirInfoC,
  RemoteFileInfoC,
]);
