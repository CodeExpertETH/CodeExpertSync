import { open } from '@tauri-apps/api/shell';
import { api } from 'api';
import React from 'react';
import { iots, pipe, taskOption } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';

export const useProjectOpen = () => {
  const openProject = React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        api.readConfigFile(`project_${projectId}.json`, iots.strict({ dir: iots.string })),
        taskOption.chainTaskK(
          ({ dir }) =>
            () =>
              open(dir),
        ),
      ),
    [],
  );

  return [openProject] as const;
};
