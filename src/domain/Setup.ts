import { api } from 'api';
import React from 'react';
import { array, iots, pipe, tagged, task, taskEither, taskOption } from '@code-expert/prelude';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';

export type SetupState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'noProjectDir'>
  | tagged.Tagged<'noProjectSync'>;
export const setupState = tagged.build<SetupState>();

export const globalSetupState = tagged.build<GlobalSetupState>();
export type GlobalSetupState =
  | tagged.Tagged<'setup', { state: SetupState }>
  | tagged.Tagged<'setupDone'>;

const getSetupStateNoSync = (): task.Task<GlobalSetupState> =>
  pipe(
    api.settingRead('projects', iots.array(ProjectMetadata)),
    taskOption.fold<GlobalSetupState, ProjectMetadata[]>(
      () => task.fromIO(() => globalSetupState.setup({ state: setupState.noProjectSync() })),
      (x) =>
        task.fromIO(() =>
          array.isEmpty(x)
            ? globalSetupState.setup({ state: setupState.noProjectSync() })
            : globalSetupState.setupDone(),
        ),
    ),
  );
const getSetupNoProjectDir = (): task.Task<GlobalSetupState> =>
  pipe(
    api.settingRead('projectDir', iots.string),
    taskOption.fold<GlobalSetupState, string>(
      () => task.fromIO(() => globalSetupState.setup({ state: setupState.noProjectDir() })),
      () => getSetupStateNoSync(),
    ),
  );
export const getSetupState = (): task.Task<GlobalSetupState> =>
  pipe(
    createSignedAPIRequest({
      path: 'app/checkAccess',
      method: 'GET',
      payload: {},
      codec: iots.strict({ status: iots.string }),
    }),
    taskEither.fold<Error, { status: string }, GlobalSetupState>(
      () => task.fromIO(() => globalSetupState.setup({ state: setupState.notAuthorized() })),
      ({ status }) =>
        status === 'Success'
          ? getSetupNoProjectDir()
          : task.fromIO(() => globalSetupState.setup({ state: setupState.notAuthorized() })),
    ),
  );
export const useSetupState = () => {
  const [state, setState] = React.useState<SetupState>(() => setupState.notAuthorized());

  React.useEffect(() => {
    //TODO update the state
  }, []);

  return [state, setState] as const;
};
