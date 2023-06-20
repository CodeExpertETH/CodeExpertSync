import React from 'react';
import { constVoid, either, flow, pipe, task } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';
import { fromError } from '@/domain/exception';
import { useGlobalContext } from '@/ui/GlobalContext';

export const useProjectRemove = () => {
  const { projectRepository } = useGlobalContext();

  return React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        projectRepository.removeProject(projectId),
        task.map(flow(either.getOrThrow(fromError), constVoid)),
      ),
    [projectRepository],
  );
};
