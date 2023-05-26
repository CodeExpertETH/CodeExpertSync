import React from 'react';
import { pipe, taskEither } from '@code-expert/prelude';
import { ProjectMetadata } from '@/domain/Project';
import { readProjectConfig, verifyProjectExistsLocal } from '@/domain/ProjectConfig';
import { invariantViolated } from '@/domain/exception';

export const useProjectVerify = () =>
  React.useCallback(
    (project: ProjectMetadata) =>
      pipe(
        taskEither.Do,
        taskEither.bind('projectConfig', () =>
          pipe(
            readProjectConfig(project.projectId),
            taskEither.fromTaskOption(() =>
              invariantViolated('No project info was found. Please contact the developers.'),
            ),
          ),
        ),
        taskEither.chain(({ projectConfig }) => verifyProjectExistsLocal(projectConfig)),
      ),
    [],
  );
