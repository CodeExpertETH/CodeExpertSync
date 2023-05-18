import { api } from 'api';
import React from 'react';
import { iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { ProjectId, readProjectConfig } from '@/domain/Project';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception } from '@/domain/exception';
import { messageT } from '@/ui/helper/message';
import { notificationT } from '@/ui/helper/notifications';

export const deleteLocalProject = (projectId: ProjectId): taskEither.TaskEither<Exception, void> =>
  pipe(
    readProjectConfig(projectId),
    taskOption.fold(
      () => taskEither.right(undefined),
      ({ dir }) => api.removeDir(dir),
    ),
  );

export const useProjectRemove = (onProjectRemove: () => void) => {
  const removeProject = React.useCallback(
    (projectId: ProjectId, projectName: string) => {
      void pipe(
        createSignedAPIRequest({
          path: 'app/projectAccess/remove',
          method: 'POST',
          payload: { projectId },
          codec: iots.strict({ removed: iots.boolean }),
        }),
        taskEither.chainW(() => deleteLocalProject(projectId)),
        taskEither.map(onProjectRemove),
        taskEither.fold(notificationT.error, () =>
          messageT.success(`The project ${projectName} was removed successfully.`),
        ),
        task.run,
      );
    },
    [onProjectRemove],
  );

  return [removeProject] as const;
};
