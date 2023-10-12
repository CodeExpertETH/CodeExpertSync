import { pipe, show, task } from '@code-expert/prelude';
import { NativePath, showNativePath } from './NativePath';
import { PfsPath, pfsPathToRelativePath } from './PfsPath';
import { ProjectBasePath, showProjectBasePath } from './ProjectBasePath';
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
  ({ rootDir, base }: ProjectDir): task.Task<NativePath> =>
    stack.append(base)(rootDir);

export const projectEntryToNativePath =
  (stack: FileSystemStack) =>
  (dir: ProjectDir, entry: PfsPath): task.Task<NativePath> =>
    pipe(
      projectDirToNativePath(stack)(dir),
      task.chain(stack.append(pfsPathToRelativePath(entry))),
    );
