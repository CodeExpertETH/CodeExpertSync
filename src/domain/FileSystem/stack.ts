import { task } from '@code-expert/prelude';

export interface Stack {
  join(...paths: Array<string>): task.Task<string>;
}
