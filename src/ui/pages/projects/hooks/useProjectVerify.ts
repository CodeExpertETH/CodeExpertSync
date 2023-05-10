import { exists } from '@tauri-apps/api/fs';
import React from 'react';
import { pipe, taskEither } from '@code-expert/prelude';
import { ProjectMetadata } from '@/domain/Project';
import { fromError, invariantViolated } from '@/domain/exception';
import { readProjectConfig } from '@/ui/pages/projects/hooks/useProjectSync';

export class ProjectVerifyException extends Error {
  declare error: 'ProjectVerifyException';

  declare reason: string;

  constructor(message: string) {
    super(message);
  }
}

export const useProjectVerify = () =>
  React.useCallback(
    (project: ProjectMetadata) =>
      pipe(
        taskEither.Do,
        taskEither.bind('projectInfo', () =>
          pipe(
            readProjectConfig(project.projectId),
            taskEither.fromTaskOption(() =>
              invariantViolated('No project info was found. Please contact the developers.'),
            ),
          ),
        ),
        taskEither.chain(({ projectInfo }) => {
          const { dir } = projectInfo;
          return pipe(
            taskEither.tryCatch(() => exists(dir), fromError),
            taskEither.chainW((doesExists) => {
              if (!doesExists) {
                return taskEither.left(
                  new ProjectVerifyException(`Project directory "${dir}" does not exist.`),
                );
              }
              return taskEither.right(undefined);
            }),
          );
        }),
        (x) => x,
      ),
    [],
  );
