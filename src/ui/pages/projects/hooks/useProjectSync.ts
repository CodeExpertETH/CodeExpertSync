import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { path } from '@tauri-apps/api';
import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { InvariantViolation, fromError } from '../../../../domain/exception';
import { message } from '../../../helper/message';

function writeSingeFile(filePath: string, projectId: ProjectId, dir: string) {
  return pipe(
    createSignedAPIRequest({
      path: `project/${projectId}/file`,
      method: 'GET',
      payload: { path: filePath },
      codec: iots.string,
      responseType: ResponseType.Text,
    }),
    taskEither.chainW((fileContent) =>
      pipe(
        taskEither.tryCatch(() => path.join(dir, filePath), fromError),
        taskEither.bindTo('path'),
        taskEither.chainFirst(({ path }) => api.writeFile(path, fileContent)),
        taskEither.bind('hash', ({ path }) => api.getFileHash(path)),
      ),
    ),
  );
}

export const useProjectSync = () => {
  const syncProject = React.useCallback((projectId: ProjectId, projectName: string) => {
    void pipe(
      createSignedAPIRequest({
        path: `project/${projectId}/info`,
        method: 'GET',
        payload: {},
        codec: iots.strict({
          _id: ProjectId,
          files: iots.array(iots.strict({ path: iots.string, version: iots.number })),
        }),
      }),
      taskEither.bindTo('project'),
      taskEither.bindW('projectDir', () =>
        pipe(
          api.settingRead('projectDir', iots.string),
          taskEither.fromTaskOption(
            () =>
              new InvariantViolation(
                'No project dir was found. Have you chosen a directory in the settings?',
              ),
          ),
          taskEither.chain((projectDir) =>
            taskEither.tryCatch(() => path.join(projectDir, projectName), fromError),
          ),
        ),
      ),
      taskEither.chainFirstTaskK(({ project, projectDir }) =>
        api.writeConfigFile(`project_${projectId}.json`, { ...project, dir: projectDir }),
      ),
      taskEither.chain(({ project, projectDir }) =>
        pipe(
          project.files,
          taskEither.traverseSeqArray((file) => writeSingeFile(file.path, projectId, projectDir)),
        ),
      ),
      taskEither.fold(
        (err) => {
          message.error(err);
          return taskEither.left(err);
        },
        () => {
          message.success(`The project ${projectName} was synced successfully.`);
          return taskEither.right(undefined);
        },
      ),
      task.run,
    );
  }, []);

  return [syncProject] as const;
};
