import { iots, number, ord, tagged, task } from '@code-expert/prelude';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { ProjectFiles } from '@/domain/ProjectFiles';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
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

export const getProjectDirRelative =
  (stack: FileSystemStack) =>
  ({ semester, courseName, exerciseName, taskName }: ProjectMetadata): task.Task<string> =>
    stack.join(
      stack.escape(semester),
      stack.escape(courseName),
      stack.escape(exerciseName),
      stack.escape(taskName),
    );
