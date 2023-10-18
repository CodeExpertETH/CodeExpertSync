import { constVoid, eq, iots, or, pipe, string, task } from '@code-expert/prelude';
import { PfsPath, PfsPathFromStringC, eqPfsPath, pfsBasename } from './PfsPath';
import { ProjectDir, projectEntryToNativePath } from './ProjectDir';
import { FileSystemStack } from './fileSystemStack';

export interface PfsDir {
  type: 'dir';
  path: PfsPath;
}

export interface PfsFile {
  type: 'file';
  path: PfsPath;
}

export type PfsNode = PfsDir | PfsFile;

// -------------------------------------------------------------------------------------------------
// Type class instances
// -------------------------------------------------------------------------------------------------

export const eqPfsNode: eq.Eq<PfsNode> = eq.struct({
  type: string.Eq,
  path: eqPfsPath,
});

// -------------------------------------------------------------------------------------------------
// Codecs to convert between the API representation and the internal cxsync representation
// -------------------------------------------------------------------------------------------------

export const PfsDirC = iots.strict({ type: iots.literal('dir'), path: PfsPathFromStringC });
export const PfsFileC = iots.strict({ type: iots.literal('file'), path: PfsPathFromStringC });

// -------------------------------------------------------------------------------------------------
// Domain functions
// -------------------------------------------------------------------------------------------------

/**
 * Tries to delete a single file.
 * Errors are silently ignored.
 */
export const deleteSingleFile =
  (stack: FileSystemStack, projectDir: ProjectDir) =>
  (file: PfsFile): task.Task<void> =>
    pipe(
      projectEntryToNativePath(stack)(projectDir, file.path),
      task.chain(stack.removeFile),
      task.map(constVoid),
    );

/**
 * We exclude known system directories and files that should never be uploaded into PFS.
 */
export const isExcludedFromPfs = ({ path }: PfsNode): boolean =>
  pipe(path, pfsBasename, or(string.endsWith('~'))(string.startsWith('.')));
