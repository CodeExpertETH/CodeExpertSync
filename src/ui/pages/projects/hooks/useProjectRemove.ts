import { api } from 'api';
import React from 'react';
import { iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { ProjectId, projectPrism } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception } from '@/domain/exception';
import { path } from '@/lib/tauri';
import { useGlobalContext } from '@/ui/GlobalContext';
import { messageT } from '@/ui/helper/message';
import { notificationT } from '@/ui/helper/notifications';

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

export const useProjectRemove = (onProjectRemove: () => void) => {
  const { projectRepository } = useGlobalContext();

  return React.useCallback(
    (projectId: ProjectId, projectName: string) => {
      void pipe(
        createSignedAPIRequest({
          path: 'app/projectAccess/remove',
          method: 'POST',
          payload: { projectId },
          codec: iots.strict({ removed: iots.boolean }),
        }),
        taskEither.chainW(() => deleteLocalProject(projectRepository)(projectId)),
        taskEither.map(onProjectRemove),
        taskEither.fold(notificationT.error, () =>
          messageT.success(`The project ${projectName} was removed successfully.`),
        ),
        task.run,
      );
    },
    [projectRepository, onProjectRemove],
  );
};
