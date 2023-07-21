import { task } from '@code-expert/prelude';

export interface FileSystemStack {
  escape(path: string): string;
  join(...paths: Array<string>): task.Task<string>;
}
