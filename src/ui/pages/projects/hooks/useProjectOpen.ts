import { open } from '@tauri-apps/api/shell';
import { api } from 'api';
import React from 'react';
import { iots, pipe, taskOption } from '@code-expert/prelude';
import { ProjectId, projectPrism } from '@/domain/Project';
import { path } from '@/lib/tauri';
import { useGlobalContext } from '@/ui/GlobalContext';

export const useProjectOpen = () => {
  const { projectRepository } = useGlobalContext();
  return React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        taskOption.sequenceS({
          rootDir: api.settingRead('projectDir', iots.string),
          project: pipe(
            projectRepository.getProject(projectId),
            taskOption.chainOptionK(projectPrism.local.getOption),
          ),
        }),
        taskOption.chain(({ rootDir, project }) =>
          taskOption.fromTaskEither(path.join(rootDir, project.value.basePath)),
        ),
        taskOption.chainTaskK((dir) => () => open(dir)),
      ),
    [projectRepository],
  );
};
