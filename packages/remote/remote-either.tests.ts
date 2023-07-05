/* eslint-env mocha */
import { pipe } from 'fp-ts/function';
import { describe, expect, it } from 'vitest';
import * as re from './remote-either';

describe('RemoteEither', () => {
  describe('ap', () => {
    const initial = re.initial;
    const pending = re.pending;
    const left = re.left<'failure', 'success'>('failure');
    const right = re.right<'success', 'failure'>('success');

    const getRE: Record<
      'initial' | 'pending' | 'left' | 'right',
      re.RemoteEither<'failure', 'success'>
    > = { initial, pending, left, right };

    const matrix = {
      left: { left, initial: left, pending: left, right: left },
      initial: { left, initial, pending: initial, right: initial },
      pending: { left, initial, pending, right: pending },
      right: { left, initial, pending, right },
    };

    for (const a of ['left', 'initial', 'pending', 'right'] as const) {
      for (const b of ['left', 'initial', 'pending', 'right'] as const) {
        it(`${a} x ${b}`, () => {
          const expected: re.RemoteEither<'failure', 'success'> = matrix[a][b];

          const reA = pipe(
            getRE[a],
            re.map((x) => () => x),
          );
          const reB = getRE[b];
          const actual = pipe(reA, re.ap(reB));
          expect(actual).toStrictEqual(expected);
        });
      }
    }
  });
});
