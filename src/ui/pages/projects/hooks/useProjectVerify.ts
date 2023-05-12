import React from 'react';
import { pipe, taskEither } from '@code-expert/prelude';
import { ProjectMetadata, loadProjectConfig, verifyProjectExistsLocal } from '@/domain/Project';

export const useProjectVerify = () =>
  React.useCallback(
    (project: ProjectMetadata) =>
      pipe(
        taskEither.Do,
        taskEither.bind('projectConfig', () => loadProjectConfig(project)),
        taskEither.chain(({ projectConfig }) => verifyProjectExistsLocal(projectConfig)),
      ),
    [],
  );
