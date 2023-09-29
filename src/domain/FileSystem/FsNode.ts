import { constVoid, eq, iots, pipe, string, task, taskEither } from '@code-expert/prelude';
import { PfsPath, PfsPathFromStringC, eqPfsPath } from './PfsPath';
import { ProjectDir, projectEntryToNativePath } from './ProjectDir';
import { FileSystemStack } from './fileSystemStack';

export interface FsDir {
  type: 'dir';
  path: PfsPath;
}

export interface FsFile {
  type: 'file';
  path: PfsPath;
}

type FsNode = FsDir | FsFile;

// -------------------------------------------------------------------------------------------------
// Type class instances
// -------------------------------------------------------------------------------------------------

export const eqFsNode: eq.Eq<FsNode> = eq.struct({
  type: string.Eq,
  path: eqPfsPath,
});

// -------------------------------------------------------------------------------------------------
// Codecs to convert between the API representation and the internal cxsync representation
// -------------------------------------------------------------------------------------------------

export const FsDirC = iots.strict({ type: iots.literal('dir'), path: PfsPathFromStringC });
export const FsFileC = iots.strict({ type: iots.literal('file'), path: PfsPathFromStringC });

// -------------------------------------------------------------------------------------------------
// Domain functions
// -------------------------------------------------------------------------------------------------

/**
 * Tries to delete a single file.
 * Errors are silently ignored.
 */
export const deleteSingleFile =
  (stack: FileSystemStack, projectDir: ProjectDir) =>
  (file: FsFile): task.Task<void> =>
    pipe(
      projectEntryToNativePath(stack)(projectDir, file.path),
      taskEither.chain(stack.removeFile),
      task.map(constVoid),
    );
