import { task, taskEither } from '@code-expert/prelude';
import { TauriException } from '@/lib/tauri/TauriException';

export interface FileSystemStack {
  escape(path: string): string;
  join(...paths: Array<string>): task.Task<string>;
  getFileHash(filePath: string): taskEither.TaskEither<TauriException, string>;
  removeFile(path: string): taskEither.TaskEither<TauriException, void>;
  stripAncestor(ancestor: string): (to: string) => taskEither.TaskEither<TauriException, string>;
  dirname(path: string): taskEither.TaskEither<TauriException, string>;
}
