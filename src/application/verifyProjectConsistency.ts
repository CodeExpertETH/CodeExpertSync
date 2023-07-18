import { api } from 'api';
import { boolean, constVoid, pipe, taskEither } from '@code-expert/prelude';
import { LocalProject } from '@/domain/Project';
import { SyncException, syncExceptionADT } from '@/domain/SyncException';

export const verifyProjectConsistency = ({
  value: { basePath },
}: LocalProject): taskEither.TaskEither<SyncException, void> =>
  pipe(
    taskEither.fromTask(api.exists(basePath)),
    taskEither.filterOrElse(boolean.isTrue, () =>
      syncExceptionADT.fileSystemCorrupted({
        path: basePath,
        reason: 'Project directory does not exist.',
      }),
    ),
    taskEither.map(constVoid),
  );
