import { api } from 'api';
import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { FsDirC, FsFileC } from '@/domain/FileSystem/RemoteNodeInfo';
import { FsDir, FsFile } from '@/lib/tauri/fs';
import { Stack } from './stack';

export type FsDirInfo = FsDir;
export const FsDirInfoC: iots.Type<FsDir> = FsDirC;

export interface FsFileInfo extends FsFile {
  hash: string;
}
export const FsFileInfoC: iots.Type<FsFileInfo> = iots.intersection([
  FsFileC,
  iots.strict({ hash: iots.string }),
]);

export type FsNodeInfo = FsDirInfo | FsFileInfo;
export const FsNodeInfoC: iots.Type<FsNodeInfo> = iots.union([FsDirInfoC, FsFileInfoC]);

// -------------------------------------------------------------------------------------------------

export const fromFsFile =
  (stack: Stack, projectDir: string) =>
  <A extends FsFile>(file: A): task.Task<A & FsFileInfo> =>
    pipe(
      stack.join(projectDir, file.path),
      task.chain(api.getFileHash),
      taskEither.getOrElse((e) => {
        throw e;
      }),
      task.map((hash) => ({ ...file, hash })),
    );
