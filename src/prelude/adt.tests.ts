/* eslint-env mocha */

/* eslint-disable no-unused-expressions, no-underscore-dangle */
import { assert, describe, it } from 'vitest';

import { DistributivePick } from '../utils/type-utils';
import * as adt from './adt';

import { pipe } from '.';

describe('prelude/adt', () => {
  describe('foldFromTags', () => {
    type T =
      | {
          _tag: 'A';
          common?: string;
        }
      | {
          _tag: 'B';
          common?: string;
          value: number;
        };
    const valueA: T = { _tag: 'A' } as T;
    const valueB: T = { _tag: 'B', value: 3 } as T;

    describe('strict', () => {
      const fft = adt.foldFromTags<T, '_tag'>('_tag');

      it('should accept data first', () => {
        assert.equal(fft(valueA, { A: () => 1, B: () => 2 }), 1);
        assert.equal(fft(valueB, { A: () => 1, B: ({ value }) => value * value }), 9);
      });

      it('should accept data last', () => {
        assert.equal(pipe(valueA, fft({ A: () => 1, B: () => 2 })), 1);
        assert.equal(pipe(valueB, fft({ A: () => 1, B: ({ value }) => value * value })), 9);
      });

      it('should not accept pattern with excessive values', () => {
        // @ts-expect-error excess property
        fft({ A: () => 1, B: () => 2, C: () => 3 });
      });

      it('should not accept incomplete patterns', () => {
        // @ts-expect-error missing property
        fft({ B: () => 2 });
      });
    });

    describe('prop', () => {
      const ffp = adt.foldFromProp('_tag');

      it('should accept data first', () => {
        assert.equal(ffp(valueA, { A: () => 1, B: () => 2 }), 1);
        assert.equal(ffp(valueB, { A: () => 1, B: ({ value }) => value * value }), 9);
      });

      it('should accept data last', () => {
        assert.equal(pipe(valueA, ffp({ A: () => 1, B: () => 2 })), 1);
        assert.equal(pipe(valueB, ffp({ A: () => 1, B: ({ value }) => value * value })), 9);
      });

      it('should not accept pattern with excessive values', () => {
        // @ts-expect-error excess property
        pipe(valueA, ffp({ A: () => 1, B: () => 2, C: () => 3 }));
      });

      it('should not accept incomplete patterns', () => {
        try {
          // @ts-expect-error missing property
          pipe(valueA, ffp({ B: () => 2 }));
        } catch {
          // ignore
        }
      });

      it('should fold over picked unions', function () {
        type U = DistributivePick<T, '_tag' | 'value'>;
        const valueC: U = { _tag: 'A' } as U;

        pipe(
          valueC,
          ffp<U, string>({
            A: (a): string => {
              // @ts-expect-error illegal property access
              if (a.common) return 'impossible!'; // eslint-disable-line @typescript-eslint/strict-boolean-expressions
              return 'correct';
            },
            B: (b) => {
              // @ts-expect-error illegal destructuring
              const { common } = b;
              if (common) return 'impossible!'; // eslint-disable-line @typescript-eslint/strict-boolean-expressions
              // @ts-expect-error illegal destructuring
              if (b.common) return 'impossible!'; // eslint-disable-line @typescript-eslint/strict-boolean-expressions
              return b.value.toString();
            },
          }),
        );
      });
    });
  });

  describe('foldFromKeys', () => {
    const ffk = adt.foldFromKeys({
      A: null,
      B: null,
    });

    it('should accept data first', () => {
      assert.equal(ffk('A', { A: () => 1, B: () => 2 }), 1);
      assert.equal(ffk('B', { A: () => 1, B: () => 2 }), 2);
    });

    it('should accept data last', () => {
      assert.equal(ffk({ A: () => 1, B: () => 2 })('A'), 1);
      assert.equal(ffk({ A: () => 1, B: () => 2 })('B'), 2);
    });

    it('should pipe data', () => {
      assert.equal(pipe('A', ffk({ A: () => 1, B: () => 2 })), 1);
      assert.equal(pipe('B', ffk({ A: () => 1, B: () => 2 })), 2);
    });

    it('should provide keys', () => {
      assert.deepEqual(ffk.keys, ['A', 'B']);
    });
  });

  describe('refinementFromProp', () => {
    type T =
      | {
          _tag: 'A';
          a: string;
        }
      | {
          _tag: 'B';
          b: number;
        };
    const valueA: T = { _tag: 'A' } as T;
    const valueB: T = { _tag: 'B', b: 3 } as T;
    const tIs = adt.refinementFromProp<T, '_tag'>('_tag');

    it('should narrow the type of valueA to A', () => {
      if (tIs.A(valueA)) {
        valueA.a;
        // @ts-expect-error no such prop
        valueA.b;

        assert.equal<'A'>(valueA._tag, 'A');
      } else {
        // @ts-expect-error no such prop
        valueA.a;
        valueA.b;

        assert.fail();
      }
    });

    it('should not narrow the type of valueB to A', () => {
      if (tIs.A(valueB)) {
        valueB.a;
        // @ts-expect-error no such prop
        valueB.b;

        assert.fail();
      } else {
        // @ts-expect-error no such prop
        valueB.a;
        valueB.b;

        assert.equal<'B'>(valueB._tag, 'B');
      }
    });

    it('should narrow the type of valueB to B', () => {
      if (tIs.B(valueB)) {
        // @ts-expect-error no such prop
        valueB.a;
        valueB.b;

        assert.equal<'B'>(valueB._tag, 'B');
      } else {
        valueB.a;
        // @ts-expect-error no such prop
        valueB.b;

        assert.fail();
      }
    });

    it('should not narrow the type of valueA to B', () => {
      if (tIs.B(valueA)) {
        // @ts-expect-error no such prop
        valueA.a;
        valueA.b;

        assert.fail();
      } else {
        valueA.a;
        // @ts-expect-error no such prop
        valueA.b;

        assert.equal<'A'>(valueA._tag, 'A');
      }
    });

    it('should narrow partial types', () => {
      const valueAPartial = { _tag: 'A' } as DistributivePick<T, '_tag'>;

      if (tIs.A(valueAPartial)) {
        // @ts-expect-error no such prop
        valueAPartial.a;

        assert.equal<'A'>(valueAPartial._tag, 'A');
      } else {
        // @ts-expect-error no such prop
        valueAPartial.b;

        assert.fail();
      }
    });
  });
});
