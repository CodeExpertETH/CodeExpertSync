import { ResponseType } from '@tauri-apps/api/http';
import { iots, taskEither } from '@code-expert/prelude';
import { PfsPath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { ApiError, apiGetSigned } from '@/utils/api';

export interface ApiStack {
  readRemoteProjectFile(
    projectId: ProjectId,
    file: PfsPath,
  ): taskEither.TaskEither<ApiError, Uint8Array>;
}

/**
 * Notes:
 * - This instance should not be defined here, but passed as an environment dependency
 * - It seems like this could be part of the {@link ProjectRepository}
 */
export const apiStack: ApiStack = {
  readRemoteProjectFile: (projectId, file) =>
    apiGetSigned({
      path: `project/${projectId}/file`,
      jwtPayload: { path: file },
      codec: iots.Uint8ArrayC,
      responseType: ResponseType.Binary,
    }),
};
