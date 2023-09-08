import { UpdateManifest } from '@tauri-apps/api/updater';
import { api } from 'api';
import {
  either,
  identity,
  iots,
  nonEmptyArray,
  option,
  pipe,
  tagged,
  task,
  taskEither,
} from '@code-expert/prelude';
import { ProjectRepository } from '@/domain/ProjectRepository';

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

const notAuthorized = globalSetupState.wide.setup({ state: setupState.notAuthorized() });
const noProjectDir = globalSetupState.wide.setup({ state: setupState.noProjectDir() });
const noProjectSync = globalSetupState.wide.setup({ state: setupState.noProjectSync() });
const done = globalSetupState.wide.setupDone();

export const getSetupState = (projectRepository: ProjectRepository): task.Task<GlobalSetupState> =>
  pipe(
    taskEither.of<GlobalSetupState, void>(undefined),
    taskEither.chainFirst(() =>
      pipe(
        api.settingRead('login', iots.literal('done')),
        taskEither.fromTaskOption(() => notAuthorized),
      ),
    ),
    taskEither.chainFirst(() =>
      pipe(
        api.settingRead('projectDir', iots.string),
        taskEither.fromTaskOption(() => noProjectDir),
      ),
    ),
    taskEither.chainEitherK(() =>
      pipe(
        projectRepository.projects.get(),
        nonEmptyArray.fromArray,
        option.map(() => done),
        either.fromOption(() => noProjectSync),
      ),
    ),
    task.map(either.getOrElse(identity)),
  );
