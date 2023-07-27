import {
  either,
  iots,
  option,
  pipe,
  string,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { TauriException } from '@/lib/tauri/TauriException';
import { panic } from '@/utils/error';

//----------------------------------------------------------------------------------------------------------------------

export type RootPath = iots.Branded<string, RootPathBrand>;
export interface RootPathBrand {
  readonly RootPath: unique symbol;
}
export const RootPathC = iots.brandIdentity(
  iots.string,
  (s): s is RootPath => s.startsWith('/'),
  'RootPath',
);

//----------------------------------------------------------------------------------------------------------------------

export type RelativeProjectPath = iots.Branded<string, RelativeProjectPathBrand>;
export interface RelativeProjectPathBrand {
  readonly RelativeProjectPath: unique symbol;
}
export const RelativeProjectPathC = iots.brandIdentity(
  iots.string,
  (s): s is RelativeProjectPath =>
    pipe(s.split('/'), (dirs) => dirs.length === 4 && dirs.every(string.isNotBlank)),
  'RelativeProjectPath',
);

//----------------------------------------------------------------------------------------------------------------------

export type ProjectPath = iots.Branded<string, ProjectPathBrand> & RootPath;
export interface ProjectPathBrand {
  readonly ProjectPath: unique symbol;
}
export const ProjectPathC = iots.brandIdentity(
  RootPathC,
  (s): s is ProjectPath => s.split('/').length > 4,
  'ProjectPath',
);

//----------------------------------------------------------------------------------------------------------------------

export type PfsPath = iots.Branded<string, PfsPathBrand>;
export interface PfsPathBrand {
  readonly PfsPath: unique symbol;
}
export const PfsPathC = iots.brandIdentity(
  iots.string,
  (s): s is PfsPath => s === '.' || s.startsWith('./'),
  'PfsPath',
);

//----------------------------------------------------------------------------------------------------------------------

export const getRelativeProjectPath =
  (stack: FileSystemStack) =>
  (
    semester: string,
    courseName: string,
    exerciseName: string,
    taskName: string,
  ): task.Task<RelativeProjectPath> =>
    stack.join(
      stack.escape(semester),
      stack.escape(courseName),
      stack.escape(exerciseName),
      stack.escape(taskName),
    ) as task.Task<RelativeProjectPath>;

export const getProjectPath =
  (stack: FileSystemStack) =>
  (rootPath: RootPath, relativeProjectPath: RelativeProjectPath): task.Task<ProjectPath> =>
    stack.join(rootPath, relativeProjectPath) as task.Task<ProjectPath>;

export const getPfsPath =
  (stack: FileSystemStack) =>
  ({
    projectPath,
    path,
  }: {
    projectPath: ProjectPath;
    path: string;
  }): taskEither.TaskEither<TauriException, PfsPath> =>
    stack.stripAncestor(projectPath)(path) as taskEither.TaskEither<TauriException, PfsPath>;

export const getPfsParent =
  (stack: FileSystemStack) =>
  (path: PfsPath): taskOption.TaskOption<PfsPath> =>
    path === '.'
      ? taskOption.none
      : (pipe(
          stack.dirname(path),
          task.map(
            either.fold(() => panic(`Unable to get parent of PfsPath: "${path}"`), option.some),
          ),
        ) as taskOption.TaskOption<PfsPath>);
