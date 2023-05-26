import { api } from 'api';
import React from 'react';
import { iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';
import { readProjectConfig } from '@/domain/ProjectConfig';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception } from '@/domain/exception';
import { path } from '@/lib/tauri';
import { messageT } from '@/ui/helper/message';
import { notificationT } from '@/ui/helper/notifications';

export const deleteLocalProject = (projectId: ProjectId): taskEither.TaskEither<Exception, void> =>
  pipe(
    taskOption.sequenceT(api.settingRead('projectDir', iots.string), readProjectConfig(projectId)),
    taskOption.chain(([rootDir, project]) =>
      taskOption.fromTaskEither(path.join(rootDir, project.dir)),
    ),
    taskOption.fold(() => taskEither.right(undefined), api.removeDir),
  );

export const useProjectRemove = (onProjectRemove: () => void) =>
  React.useCallback(
    (projectId: ProjectId, projectName: string) => {
      void pipe(
        createSignedAPIRequest({
          path: 'app/projectAccess/remove',
          method: 'POST',
          payload: { projectId },
          codec: iots.strict({ removed: iots.boolean }),
        }),
        taskEither.chainW(() => deleteLocalProject(projectId)),
        taskEither.map(onProjectRemove),
        taskEither.fold(notificationT.error, () =>
          messageT.success(`The project ${projectName} was removed successfully.`),
        ),
        task.run,
      );
    },
    [onProjectRemove],
  );
