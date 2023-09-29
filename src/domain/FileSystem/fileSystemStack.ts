import { option, taskEither, taskOption, tree } from '@code-expert/prelude';
import { fs as libFs, os as libOs, path as libPath } from '@/lib/tauri';
import { TauriException } from '@/lib/tauri/TauriException';
import { FsNode } from '@/lib/tauri/fs';
import { NativePath } from './NativePath';
import { Path } from './Path';

export interface FileSystemStack {
  append: (
    relative: Path,
  ) => (base: NativePath) => taskEither.TaskEither<TauriException, NativePath>;
  parseNativePath: (path: NativePath) => taskEither.TaskEither<TauriException, option.Option<Path>>;
  toNativePath: (path: Path) => taskEither.TaskEither<TauriException, NativePath>;
  getFileHash: (filePath: NativePath) => taskEither.TaskEither<TauriException, string>;
  removeFile: (path: NativePath) => taskEither.TaskEither<TauriException, void>;
  stripAncestor: (
    ancestor: NativePath,
  ) => (path: NativePath) => taskEither.TaskEither<TauriException, NativePath>;
  basename: (path: NativePath) => taskOption.TaskOption<string>;
  tempDir: taskEither.TaskEither<TauriException, NativePath>;
  readBinaryFile: (filePath: NativePath) => taskEither.TaskEither<TauriException, Uint8Array>;
  readFsTree: (dir: NativePath) => taskEither.TaskEither<TauriException, tree.Tree<FsNode>>;
  writeFileWithAncestors: (
    filePath: NativePath,
    content: Uint8Array,
  ) => taskEither.TaskEither<TauriException, void>;
}

/**
 * Notes:
 * - This instance should not be defined here, but passed as an environment dependency
 * - Such low-level file system operations should likely not be part of the domain
 */
export const fileSystemStack: FileSystemStack = {
  append: libPath.append,
  parseNativePath: libPath.parseNativePath,
  toNativePath: libPath.toNativePath,
  getFileHash: libFs.getFileHash,
  removeFile: libFs.removeFile,
  stripAncestor: libPath.stripAncestor,
  basename: libPath.basename,
  tempDir: libOs.tempDir,
  readBinaryFile: libFs.readBinaryFile,
  readFsTree: libFs.readFsTree,
  writeFileWithAncestors: libFs.writeFileWithAncestors,
};
