import { open } from '@tauri-apps/api/shell';
import { api } from 'api';
import React from 'react';
import { iots, pipe, taskOption } from '@code-expert/prelude';
import { ProjectId, readProjectConfig } from '@/domain/Project';
import { path } from '@/lib/tauri';

export const useProjectOpen = () =>
  React.useCallback(
    (projectId: ProjectId) =>
      pipe(
        taskOption.sequenceT(
          api.settingRead('projectDir', iots.string),
          readProjectConfig(projectId),
        ),
        taskOption.chain(([rootDir, project]) =>
          taskOption.fromTaskEither(path.join(rootDir, project.dir)),
        ),
        taskOption.chainTaskK((dir) => () => open(dir)),
      ),
    [],
  );
