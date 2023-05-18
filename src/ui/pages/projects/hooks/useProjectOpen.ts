import { open } from '@tauri-apps/api/shell';
import React from 'react';
import { pipe, taskOption } from '@code-expert/prelude';
import { ProjectId, readProjectConfig } from '@/domain/Project';

export const useProjectOpen = () => {
  const openProject = React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        readProjectConfig(projectId),
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
