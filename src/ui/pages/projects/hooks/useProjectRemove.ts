import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';

export const useProjectRemove = (onProjectRemove: () => void) => {
  const removeProject = React.useCallback(
    (projectId: ProjectId) => {
      void pipe(
        createSignedAPIRequest({
          path: 'app/projectAccess/remove',
          method: 'POST',
          payload: { projectId },
          codec: iots.strict({ removed: iots.boolean }),
        }),
        //do here more code like removing the project from disk...
        taskEither.map(onProjectRemove),
        task.run,
      );
    },
    [onProjectRemove],
  );

  return [removeProject] as const;
};
