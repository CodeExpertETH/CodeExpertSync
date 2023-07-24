import { task, taskEither } from '@code-expert/prelude';
import { TauriException } from '@/lib/tauri/TauriException';

export interface FileSystemStack {
  escape(path: string): string;
  join(...paths: Array<string>): task.Task<string>;
  getFileHash(filePath: string): taskEither.TaskEither<TauriException, string>;
}
