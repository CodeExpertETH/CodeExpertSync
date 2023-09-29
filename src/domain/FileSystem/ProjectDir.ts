import { pipe, show, taskEither } from '@code-expert/prelude';
import { TauriException } from '@/lib/tauri/TauriException';
import { NativePath, showNativePath } from './NativePath';
import { PfsPath, pfsPathToRelativePath } from './PfsPath';
import {
  ProjectBasePath,
  projectBasePathToRelativePath,
  showProjectBasePath,
} from './ProjectBasePath';
import { FileSystemStack } from './fileSystemStack';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

export interface ProjectDir {
  rootDir: NativePath;
  base: ProjectBasePath;
}

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const showProjectDir: show.Show<ProjectDir> = {
  show: ({ rootDir, base }) => `${showNativePath.show(rootDir)}/${showProjectBasePath.show(base)}`,
};

//----------------------------------------------------------------------------------------------------------------------
// Domain functions
//----------------------------------------------------------------------------------------------------------------------

export const projectDirToNativePath =
  (stack: FileSystemStack) =>
  ({ rootDir, base }: ProjectDir): taskEither.TaskEither<TauriException, NativePath> =>
    stack.append(projectBasePathToRelativePath(base))(rootDir);

export const projectEntryToNativePath =
  (stack: FileSystemStack) =>
  (dir: ProjectDir, entry: PfsPath): taskEither.TaskEither<TauriException, NativePath> =>
    pipe(
      projectDirToNativePath(stack)(dir),
      taskEither.chain(stack.append(pfsPathToRelativePath(entry))),
    );
