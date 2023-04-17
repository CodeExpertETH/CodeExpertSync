import { pipe, task } from '@code-expert/prelude';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';

export const useProjectSync = () => {
  const syncProject = React.useCallback((projectId: ProjectId) => {
    console.log(`sync project code ${projectId}}`);
    void pipe(
      // createSignedAPIRequest({
      //   path: 'app/projectAccess/remove',
      //   method: 'POST',
      //   payload: { projectId },
      //   codec: iots.strict({ removed: iots.boolean }),
      // }),
      //do here more code like removing the project from disk...
      task.run,
    );
  }, []);

  return [syncProject] as const;
};
