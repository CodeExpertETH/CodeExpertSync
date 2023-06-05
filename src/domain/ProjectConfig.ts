import { api } from 'api';
import { iots, pipe, taskEither } from '@code-expert/prelude';
import { FileC } from '@/domain/File';
import { Exception } from '@/domain/exception';

export const ProjectConfigC = iots.strict({
  basePath: iots.string,
  files: iots.array(FileC),
  syncedAt: iots.DateFromISOString,
});
export type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

export class ProjectVerifyException extends Error {
  declare error: 'ProjectVerifyException';

  declare reason: string;

  constructor(message: string) {
    super(message);
  }
}

export const verifyProjectExistsLocal = (
  projectConfig: ProjectConfig,
): taskEither.TaskEither<ProjectVerifyException | Exception, void> => {
  const { basePath } = projectConfig;
  return pipe(
    taskEither.fromTask(api.exists(basePath)),
    taskEither.chainW((doesExists) => {
      if (!doesExists) {
        return taskEither.left(
          new ProjectVerifyException(`Project directory "${basePath}" does not exist.`),
        );
      }
      return taskEither.right(undefined);
    }),
  );
};
