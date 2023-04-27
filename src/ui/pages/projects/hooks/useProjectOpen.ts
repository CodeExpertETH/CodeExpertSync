import { iots, pipe, task, taskOption } from '@code-expert/prelude';
import { open } from '@tauri-apps/api/shell';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';

export const useProjectOpen = () => {
  const openProject = React.useCallback((projectId: ProjectId) => {
    void pipe(
      api.readConfigFile(`project_${projectId}.json`, iots.strict({ dir: iots.string })),
      taskOption.chainTaskK(({ dir }) => {
        console.log(dir);
        return () => open(dir);
      }),
      (x) => x,
      task.run,
    );
  }, []);

  return [openProject] as const;
};
