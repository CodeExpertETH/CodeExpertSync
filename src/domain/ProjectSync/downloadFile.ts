import { pipe, task, taskEither } from '@code-expert/prelude';
import { PfsPath, ProjectPath, RemoteNodeInfo } from '@/domain/FileSystem';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { ProjectId } from '@/domain/Project';
import { ApiStack } from '@/domain/ProjectSync/apiStack';
import { SyncException, fromHttpError, syncExceptionADT } from '@/domain/SyncException';
import { TauriException } from '@/lib/tauri/TauriException';

export const downloadFile =
  (stack: FileSystemStack & ApiStack) =>
  ({
    fileInfo,
    projectId,
    projectDir,
  }: {
    fileInfo: RemoteNodeInfo;
    projectId: ProjectId;
    projectDir: ProjectPath;
  }): taskEither.TaskEither<SyncException, void> =>
    pipe(
      stack.readRemoteProjectFile(projectId, fileInfo.path),
      taskEither.mapLeft(fromHttpError),
      taskEither.chain((fileContent) =>
        pipe(
          writeProjectFile(stack)(projectDir, fileInfo.path, fileContent),
          taskEither.mapLeft(({ message: reason }) =>
            syncExceptionADT.wide.fileSystemCorrupted({ path: fileInfo.path, reason }),
          ),
        ),
      ),
    );

const writeProjectFile =
  (stack: FileSystemStack) =>
  (
    projectDir: ProjectPath,
    file: PfsPath,
    content: Uint8Array,
  ): taskEither.TaskEither<TauriException, void> =>
    pipe(
      stack.join(projectDir, file),
      task.chain((path) => stack.writeFileWithAncestors(path, content)),
    );
