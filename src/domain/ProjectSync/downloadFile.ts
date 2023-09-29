import { pipe, taskEither } from '@code-expert/prelude';
import {
  PfsPath,
  ProjectDir,
  RemoteFileInfo,
  projectEntryToNativePath,
  showPfsPath,
} from '@/domain/FileSystem';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { ProjectId } from '@/domain/Project';
import { ApiStack } from '@/domain/ProjectSync/apiStack';
import { SyncException, fromHttpError, syncExceptionADT } from '@/domain/SyncException';
import { TauriException } from '@/lib/tauri/TauriException';

export const downloadFile =
  (stack: FileSystemStack & ApiStack) =>
  ({
    file,
    projectId,
    projectDir,
  }: {
    file: RemoteFileInfo;
    projectId: ProjectId;
    projectDir: ProjectDir;
  }): taskEither.TaskEither<SyncException, void> =>
    pipe(
      stack.readRemoteProjectFile(projectId, file.path),
      taskEither.mapLeft(fromHttpError),
      taskEither.chain((fileContent) =>
        pipe(
          writeProjectFile(stack)(projectDir, file.path, fileContent),
          taskEither.mapLeft(({ message: reason }) =>
            syncExceptionADT.wide.fileSystemCorrupted({
              path: showPfsPath.show(file.path),
              reason: `Could not write project file (${reason})`,
            }),
          ),
        ),
      ),
    );

const writeProjectFile =
  (stack: FileSystemStack) =>
  (
    projectDir: ProjectDir,
    file: PfsPath,
    content: Uint8Array,
  ): taskEither.TaskEither<TauriException, void> =>
    pipe(
      projectEntryToNativePath(stack)(projectDir, file),
      taskEither.chain((path) => stack.writeFileWithAncestors(path, content)),
    );
