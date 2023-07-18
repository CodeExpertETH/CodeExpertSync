import { boolean, constVoid, pipe, taskEither } from '@code-expert/prelude';
import { LocalProject } from '@/domain/Project';
import { SyncException, syncExceptionADT } from '@/domain/SyncException';
import { exists } from '@/lib/tauri/fs';

export const verifyProjectConsistency = ({
  value: { basePath },
}: LocalProject): taskEither.TaskEither<SyncException, void> =>
  pipe(
    taskEither.fromTask(exists(basePath)),
    taskEither.filterOrElse(boolean.isTrue, () =>
      syncExceptionADT.fileSystemCorrupted({
        path: basePath,
        reason: 'Project directory does not exist.',
      }),
    ),
    taskEither.map(constVoid),
  );
