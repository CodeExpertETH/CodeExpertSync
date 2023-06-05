import { api } from 'api';
import { pipe, taskEither } from '@code-expert/prelude';
import { LocalProject } from '@/domain/Project';
import { Exception } from '@/domain/exception';

export class ProjectVerifyException extends Error {
  declare error: 'ProjectVerifyException';

  declare reason: string;

  constructor(message: string) {
    super(message);
  }
}

export const verifyProjectExistsLocal = ({
  value: { basePath },
}: LocalProject): taskEither.TaskEither<ProjectVerifyException | Exception, void> =>
  pipe(
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
