import { taskEither } from '@code-expert/prelude';
import { PfsPath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { ApiError } from '@/utils/api';

export interface ApiStack {
  readRemoteProjectFile(
    projectId: ProjectId,
    file: PfsPath,
  ): taskEither.TaskEither<ApiError, Uint8Array>;
}
