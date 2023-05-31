import { api } from 'api';
import React from 'react';
import { array, iots, pipe, remoteData, task, taskEither, taskOption } from '@code-expert/prelude';
import { Project, getProject } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception } from '@/domain/exception';
import { notificationT } from '@/ui/helper/notifications';
import { useRaceState } from '@/ui/hooks/useRaceState';

const getProjects = (projects: Array<ProjectMetadata>): task.Task<Array<Project>> =>
  pipe(projects, task.traverseArray(getProject), task.map(array.unsafeFromReadonly));

export const useProjects = () => {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, Array<Project>>>(
    remoteData.initial,
  );

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead('projects', iots.array(ProjectMetadata)),
      taskOption.getOrElseW(() => task.of([])),
      task.chain(getProjects),
      task.map(remoteData.success),
      task.chainIOK((s) => () => setState(s)),
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
      taskEither.chainTaskK(getProjects),
      taskEither.map(remoteData.success),
      taskEither.chainIOK((s) => () => setState(s)),
      taskEither.fold(notificationT.error, task.of),
      task.run,
    );
  }, [mkSetState]);

  return [state, updateProjects] as const;
};
