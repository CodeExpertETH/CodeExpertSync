import { iots, option, pipe, remoteData, task, taskEither } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { ProjectMetadata } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { Exception } from '../../../../domain/exception';
import { useRaceState } from '../../../hooks/useRaceState';

export const useProjects = () => {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, ProjectMetadata[]>>(
    remoteData.initial,
  );

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead('projects', iots.array(ProjectMetadata)),
      task.map(option.getOrElse(() => [] as ProjectMetadata[])),
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
      task.map((e) => {
        console.log(e);
        return e;
      }),
      taskEither.chainFirstTaskK((projects) => api.settingWrite('projects', projects)),
      taskEither.map(remoteData.success),
      taskEither.map(setState),
      task.run,
    );
  }, [mkSetState]);

  return [state, updateProjects] as const;
};
