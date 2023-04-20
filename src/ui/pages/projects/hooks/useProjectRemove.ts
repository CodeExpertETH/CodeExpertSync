import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { message } from '../../../helper/message';

export const useProjectRemove = (onProjectRemove: () => void) => {
  const removeProject = React.useCallback(
    (projectId: ProjectId, projectName: string) => {
      void pipe(
        api.readConfigFile(`project_${projectId}.json`, iots.strict({ dir: iots.string })),
        taskEither.fromTaskOption(() => new Error('Failed to find project settings.')),
        taskEither.chainW(({ dir }) => api.removeDir(dir)),
        taskEither.chain(() =>
          createSignedAPIRequest({
            path: 'app/projectAccess/remove',
            method: 'POST',
            payload: { projectId },
            codec: iots.strict({ removed: iots.boolean }),
          }),
        ),
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
