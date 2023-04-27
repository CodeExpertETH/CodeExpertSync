import { array, iots, pipe, remoteData, task, taskEither, taskOption } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import {
  ExtendedProjectMetadata,
  ProjectMetadata,
  projectSyncState,
} from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { Exception } from '../../../../domain/exception';
import { useRaceState } from '../../../hooks/useRaceState';

const getSyncState = (projects: Array<ProjectMetadata>) =>
  pipe(
    projects,
    task.traverseArray((project) =>
      pipe(
        api.readConfigFile(`project_${project.projectId}.json`, iots.strict({ dir: iots.string })),
        taskOption.foldW(
          () => task.of(projectSyncState.notSynced()),
          ({ dir }) => task.of(projectSyncState.synced({ dir })),
        ),
        task.map((syncState) => ({ ...project, syncState })),
      ),
    ),
    task.map(array.unsafeFromReadonly),
  );

export const useProjects = () => {
  const [state, mkSetState] = useRaceState<
    remoteData.RemoteData<Exception, Array<ExtendedProjectMetadata>>
  >(remoteData.initial);

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead('projects', iots.array(ProjectMetadata)),
      taskOption.chainTaskK(getSyncState),
      taskOption.getOrElseW(() => task.of([])),
      task.map(remoteData.success),
      task.map(setState),
      task.run,
    );
  }, [mkSetState]);

  const updateProjects = React.useCallback(() => {
    const setState = mkSetState();
    void pipe(
      createSignedAPIRequest({
        path: 'project/metadata',
        method: 'GET',
        payload: {},
        codec: iots.array(ProjectMetadata),
      }),
      taskEither.chainFirstTaskK((projects) => api.settingWrite('projects', projects)),
      taskEither.chainTaskK(getSyncState),
      taskEither.map(remoteData.success),
      taskEither.map(setState),
      task.run,
    );
  }, [mkSetState]);

  return [state, updateProjects] as const;
};
