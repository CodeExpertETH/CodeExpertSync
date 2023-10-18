import React from 'react';
import { pipe, task, taskOption } from '@code-expert/prelude';
import { isoNativePath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { open } from '@/lib/tauri/shell';
import { useGlobalContext } from '@/ui/GlobalContext';
import { panic } from '@/utils/error';

export const useProjectOpen = () => {
  const { projectRepository } = useGlobalContext();
  return React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        projectRepository.getProjectDir(projectId),
        taskOption.getOrElse(
          () => () => panic('Tried to open project but root directory is not set'),
        ),
        task.map(isoNativePath.unwrap),
        task.chain(open),
      ),
    [projectRepository],
  );
};
