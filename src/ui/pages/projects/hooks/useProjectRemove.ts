import { api } from 'api';
import React from 'react';
import {
  constVoid,
  either,
  flow,
  iots,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { ProjectId, projectPrism } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception, fromError } from '@/domain/exception';
import { path } from '@/lib/tauri';
import { useGlobalContext } from '@/ui/GlobalContext';

export const deleteLocalProject =
  (projectRepository: ProjectRepository) =>
  (projectId: ProjectId): taskEither.TaskEither<Exception, void> =>
    pipe(
      taskOption.sequenceS({
        rootDir: api.settingRead('projectDir', iots.string),
        project: pipe(
          projectRepository.getProject(projectId),
          taskOption.chainOptionK(projectPrism.local.getOption),
        ),
      }),
      taskOption.chain(({ rootDir, project }) =>
        taskOption.fromTaskEither(path.join(rootDir, project.value.basePath)),
      ),
      taskOption.fold(() => taskEither.right(undefined), api.removeDir),
    );

export const useProjectRemove = () => {
  const { projectRepository } = useGlobalContext();

  return React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        createSignedAPIRequest({
          path: 'app/projectAccess/remove',
          method: 'POST',
          jwtPayload: { projectId },
          codec: iots.strict({ removed: iots.boolean }),
        }),
        taskEither.chainW(() => deleteLocalProject(projectRepository)(projectId)),
        task.map(flow(either.getOrThrow(fromError), constVoid)),
      ),
    [projectRepository],
  );
};
