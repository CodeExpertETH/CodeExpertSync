import { api } from 'api';
import { iots, number, ord, pipe, tagged, task, taskOption } from '@code-expert/prelude';
import {
  NativePathFromStringC,
  ProjectBasePath,
  ProjectDir,
  mkProjectBasePath,
} from '@/domain/FileSystem';
import { ProjectFiles } from '@/domain/ProjectFiles';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { panic } from '@/utils/error';
import { mkEntityIdCodec } from '@/utils/identity';

export { projectDirToNativePath } from '@/domain/FileSystem';

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

export const getProjectBasePath: (project: Project) => ProjectBasePath = projectADT.fold({
  remote: ({ semester: s, courseName: c, exerciseName: e, taskName: t }) =>
    mkProjectBasePath(s, c, e, t),
  local: ({ basePath }) => basePath,
});

export const getProjectDir = (project: Project): task.Task<ProjectDir> =>
  pipe(
    task.Do,
    task.let('base', () => getProjectBasePath(project)),
    task.bind('rootDir', () =>
      pipe(
        api.settingRead('projectDir', NativePathFromStringC), // FIXME: this is called 'rootDir' now
        taskOption.getOrElse(() => panic('Root Directory is not set')),
      ),
    ),
  );
