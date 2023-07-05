import { UpdateManifest } from '@tauri-apps/api/updater';
import { api } from 'api';
import {
  iots,
  nonEmptyArray,
  option,
  pipe,
  tagged,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { httpGetSigned } from '@/utils/httpSigned';

export type SetupState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'noProjectDir'>
  | tagged.Tagged<'noProjectSync'>;
export const setupState = tagged.build<SetupState>();

export const globalSetupState = tagged.build<GlobalSetupState>();
export type GlobalSetupState =
  | tagged.Tagged<'setup', { state: SetupState }>
  | tagged.Tagged<'update', { manifest: UpdateManifest }>
  | tagged.Tagged<'setupDone'>;

const getSetupStateNoSync = (projectRepository: ProjectRepository): GlobalSetupState =>
  pipe(
    projectRepository.projects.get(),
    nonEmptyArray.fromArray,
    option.fold(
      () => globalSetupState.wide.setup({ state: setupState.noProjectSync() }),
      () => globalSetupState.setupDone(),
    ),
  );
const getSetupNoProjectDir = (projectRepository: ProjectRepository): task.Task<GlobalSetupState> =>
  pipe(
    api.settingRead('projectDir', iots.string),
    taskOption.fold<GlobalSetupState, string>(
      () => task.fromIO(() => globalSetupState.setup({ state: setupState.noProjectDir() })),
      () => task.fromIO(() => getSetupStateNoSync(projectRepository)),
    ),
  );
export const getSetupState = (projectRepository: ProjectRepository): task.Task<GlobalSetupState> =>
  pipe(
    httpGetSigned({
      path: 'app/assertAccess',
      codec: iots.strict({ status: iots.string }),
    }),
    taskEither.fold<Error, { status: string }, GlobalSetupState>(
      () => task.fromIO(() => globalSetupState.setup({ state: setupState.notAuthorized() })),
      ({ status }) =>
        status === 'Success'
          ? getSetupNoProjectDir(projectRepository)
          : task.fromIO(() => globalSetupState.setup({ state: setupState.notAuthorized() })),
    ),
  );
