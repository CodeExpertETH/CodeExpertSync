import { flow, iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { Exception } from '../../../../domain/exception';
import { message } from '../../../helper/message';

const deleteLocalProject = (projectId: ProjectId): (() => taskEither.TaskEither<Exception, void>) =>
  flow(
    () => api.readConfigFile(`project_${projectId}.json`, iots.strict({ dir: iots.string })),
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
        taskEither.chainW(deleteLocalProject(projectId)),
        taskEither.map(onProjectRemove),
        taskEither.fold(
          (err) => {
            message.error(err);
            return taskEither.left(err);
          },
          () => {
            message.success(`The project ${projectName} was removed successfully.`);
            return taskEither.right(undefined);
          },
        ),
        task.run,
      );
    },
    [onProjectRemove],
  );

  return [removeProject] as const;
};
