import { task } from './index';
import { describe, it } from 'vitest';

describe('task', () => {
  describe('fromPromiseK', () => {
    it('should raise an error for implicit any', () => {
      task.fromPromiseK(
        // @ts-expect-error implicit any
        (_a) =>
          Promise.resolve(`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`),
      );
    });

    it('should raise an error when the wrapped function does not return a promise', () => {
      task.fromPromiseK(
        () =>
          // @ts-expect-error not returning a promise
          'waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaat',
      );
    });
  });
});
