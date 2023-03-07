import { array, ioRef, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { assert, describe, it } from 'vitest';

import { logTime } from './profiling';

describe('logTime', () => {
  it('should work correctly', async () => {
    const ms = 1000;

    const longRunningTask: task.Task<void> = () =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const log = await pipe(
      task.fromIO(ioRef.newIORef(new Array<string>())),
      task.chain((log) =>
        pipe(
          logTime(task.MonadIO, flow(array.append, log.modify, task.fromIO))(
            longRunningTask,
            'long-running task',
          ),
          task.chain(() => task.fromIO(log.read)),
        ),
      ),
      (t) => t(),
    );

    assert.equal(log[0], 'Starting task "long-running task"');
    assert.match(log[1], /Task "long-running task" took (9|10)\d\d ms/);
  });
});
