import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';

function writeSingeFile(filePath: string, projectId: ProjectId, dirPath: string) {
  const cleanedPath = filePath.replace(/^\.\//, '');
  return pipe(
    createSignedAPIRequest({
      path: `project/${projectId}/file`,
      method: 'GET',
      payload: { path: filePath },
      codec: iots.string,
      responseType: ResponseType.Text,
    }),
    taskEither.chain((fileContent) =>
      pipe(
        api.settingRead('projectDir', iots.string),
        taskEither.fromTaskOption(
          () => new Error('No project dir was found. Please contact the developers.'),
        ),
        taskEither.chainW((projectDir) =>
          api.writeFile(`${projectDir}/${dirPath}/${cleanedPath}`, fileContent),
        ),
      ),
    ),
  );
}

export const useProjectSync = () => {
  const syncProject = React.useCallback((projectId: ProjectId, filePath: string) => {
    console.log(`sync project code ${projectId}`);
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
      taskEither.chainFirstTaskK((project) =>
        api.writeConfigFile(`project_${projectId}.json`, project),
      ),
      taskEither.chain((project) =>
        pipe(
          project.files,
          taskEither.traverseSeqArray((file) => writeSingeFile(file.path, projectId, filePath)),
        ),
      ),
      task.run,
    );
  }, []);

  return [syncProject] as const;
};
