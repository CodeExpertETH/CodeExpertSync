import { UpdateManifest } from '@tauri-apps/api/updater';
import { api } from 'api';
import {
  either,
  identity,
  iots,
  nonEmptyArray,
  pipe,
  tagged,
  task,
  taskEither,
} from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { ProjectRepository } from '@/domain/ProjectRepository';

export type SetupState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'noRootDir'>
  | tagged.Tagged<'noProjectSync', { clientId: ClientId }>;
export const setupState = tagged.build<SetupState>();

export const globalSetupState = tagged.build<GlobalSetupState>();
export type GlobalSetupState =
  | tagged.Tagged<'setup', { state: SetupState }>
  | tagged.Tagged<'update', { manifest: UpdateManifest }>
  | tagged.Tagged<'setupDone', { clientId: ClientId }>;

const notAuthorized = globalSetupState.wide.setup({ state: setupState.notAuthorized() });
const noRootDir = globalSetupState.wide.setup({ state: setupState.noRootDir() });
const noProjectSync = (clientId: ClientId) =>
  globalSetupState.wide.setup({ state: setupState.noProjectSync({ clientId }) });

const done = globalSetupState.wide.setupDone;

export const getSetupState = (projectRepository: ProjectRepository): task.Task<GlobalSetupState> =>
  pipe(
    taskEither.of<GlobalSetupState, void>(undefined),
    taskEither.chain(() =>
      pipe(
        api.settingRead('login', iots.literal('done')),
        task.chain(() => api.settingRead('clientId', ClientId)),
        taskEither.fromTaskOption(() => notAuthorized),
      ),
    ),
    taskEither.chainFirst(() =>
      pipe(
        api.settingRead('rootDir', iots.string),
        taskEither.fromTaskOption(() => noRootDir),
      ),
    ),
    taskEither.chainFirstEitherK((clientId) =>
      pipe(
        projectRepository.projects.get(),
        nonEmptyArray.fromArray,
        either.fromOption(() => noProjectSync(clientId)),
      ),
    ),
    // otherwise: setup complete
    task.map(either.fold(identity, (clientId) => done({ clientId }))),
  );
