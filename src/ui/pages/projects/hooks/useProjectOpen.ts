import { open } from '@tauri-apps/api/shell';
import React from 'react';
import { pipe, taskOption } from '@code-expert/prelude';
import { isoNativePath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { useGlobalContext } from '@/ui/GlobalContext';

export const useProjectOpen = () => {
  const { projectRepository } = useGlobalContext();
  return React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        projectRepository.getProjectDir(projectId),
        taskOption.map(isoNativePath.unwrap),
        taskOption.chainTaskK((dir) => () => open(dir)),
      ),
    [projectRepository],
  );
};
