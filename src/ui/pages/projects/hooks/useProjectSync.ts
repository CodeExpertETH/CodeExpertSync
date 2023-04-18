import { iots, pipe, task, taskEither } from '@code-expert/prelude';
import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';

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
      taskEither.chain((project) => {
        //TODO loop over all files and save them to disk
        const file = project.files[0];
        //remove ./ from the path
        const cleanedPath = file.path.replace(/^\.\//, '');
        console.log(file);
        return pipe(
          createSignedAPIRequest({
            path: `project/${projectId}/file`,
            method: 'GET',
            payload: { path: file.path },
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
                api.writeFile(`${projectDir}/${filePath}/${cleanedPath}`, fileContent),
              ),
            ),
          ),
        );
      }),
      task.map((project) => {
        console.log(project);
        return project;
      }),

      // get project files

      // save project files to disk
      // createSignedAPIRequest({
      //   path: 'app/projectAccess/remove',
      //   method: 'POST',
      //   payload: { projectId },
      //   codec: iots.strict({ removed: iots.boolean }),
      // }),
      //do here more code like removing the project from disk...
      task.run,
    );
  }, []);

  return [syncProject] as const;
};
