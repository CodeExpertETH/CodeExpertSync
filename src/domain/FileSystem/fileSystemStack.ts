import { task, taskEither, taskOption, tree } from '@code-expert/prelude';
import { fs as libFs, os as libOs, path as libPath } from '@/lib/tauri';
import { TauriException } from '@/lib/tauri/TauriException';
import { FsNode } from '@/lib/tauri/fs';

export interface FileSystemStack {
  escape(path: string): string;
  join(...paths: Array<string>): task.Task<string>;
  getFileHash(filePath: string): taskEither.TaskEither<TauriException, string>;
  removeFile(path: string): taskEither.TaskEither<TauriException, void>;
  stripAncestor(ancestor: string): (to: string) => taskEither.TaskEither<TauriException, string>;
  dirname(path: string): taskEither.TaskEither<TauriException, string>;
  basename(path: string): taskOption.TaskOption<string>;
  tempDir: taskEither.TaskEither<TauriException, string>;
  readBinaryFile(filePath: string): taskEither.TaskEither<TauriException, Uint8Array>;
  readFsTree(dir: string): taskEither.TaskEither<TauriException, tree.Tree<FsNode>>;
  writeFileWithAncestors(
    filePath: string,
    content: Uint8Array,
  ): taskEither.TaskEither<TauriException, void>;
}

/**
 * Notes:
 * - This instance should not be defined here, but passed as an environment dependency
 * - Such low-level file system operations should likely not be part of the domain
 */
export const fileSystemStack: FileSystemStack = {
  escape: libPath.escape,
  join: libPath.join,
  dirname: libPath.dirname,
  stripAncestor: libPath.stripAncestor,
  getFileHash: libFs.getFileHash,
  removeFile: libFs.removeFile,
  basename: libPath.basename,
  tempDir: libOs.tempDir,
  readBinaryFile: libFs.readBinaryFile,
  readFsTree: libFs.readFsTree,
  writeFileWithAncestors: libFs.writeFileWithAncestors,
};
