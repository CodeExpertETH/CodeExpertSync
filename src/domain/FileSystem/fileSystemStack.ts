import { task, taskEither, taskOption, tree } from '@code-expert/prelude';
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
