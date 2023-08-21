import { api } from 'api';
import { iots, number, ord, pipe, tagged, task, taskEither } from '@code-expert/prelude';
import {
  ProjectPath,
  RelativeProjectPath,
  RootPathC,
  getProjectPath as fsGetProjectPath,
  getRelativeProjectPath,
} from '@/domain/FileSystem';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { ProjectFiles } from '@/domain/ProjectFiles';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { ApiStack } from '@/domain/ProjectSync/apiStack';
import { SyncException, syncExceptionADT } from '@/domain/SyncException';
import { mkEntityIdCodec } from '@/utils/identity';

export const ProjectIdBrand = Symbol('ProjectId');
export const ProjectId = mkEntityIdCodec(ProjectIdBrand);
export type ProjectId = iots.TypeOf<typeof ProjectId>;

export type RemoteProject = tagged.Tagged<'remote', ProjectMetadata>;

export type LocalProject = tagged.Tagged<'local', ProjectMetadata & ProjectFiles>;

export type Project = RemoteProject | LocalProject;

export const projectADT = tagged.build<Project>();

export const projectPrism = tagged.prisms<Project>();

export const ordProjectTask = ord.contramap((x: Project) => x.value.taskOrder)(number.Ord);

export const ordProjectExercise = ord.contramap((x: Project) => x.value.exerciseOrder)(number.Ord);

// -------------------------------------------------------------------------------------------------

export const getProjectDirRelative: (
  stack: FileSystemStack,
) => (project: Project) => task.Task<RelativeProjectPath> = (stack) =>
  projectADT.fold({
    remote: ({ semester: s, courseName: c, exerciseName: e, taskName: t }) =>
      getRelativeProjectPath(stack)(s, c, e, t),
    local: ({ basePath }) => task.of(basePath),
  });

export const getProjectPath =
  (stack: FileSystemStack & ApiStack) =>
  (
    project: Project,
  ): taskEither.TaskEither<
    SyncException,
    { absolute: ProjectPath; relative: RelativeProjectPath }
  > =>
    pipe(
      taskEither.Do,
      taskEither.bind('rootDir', () =>
        pipe(
          api.settingRead('projectDir', RootPathC),
          taskEither.fromTaskOption(() => syncExceptionADT.wide.projectDirMissing()),
        ),
      ),
      taskEither.bindTaskK('relative', () => getProjectDirRelative(stack)(project)),
      taskEither.bindTaskK('absolute', ({ rootDir, relative }) =>
        fsGetProjectPath(stack)(rootDir, relative),
      ),
      taskEither.map(({ relative, absolute }) => ({ relative, absolute })),
    );
