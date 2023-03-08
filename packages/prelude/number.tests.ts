import { fc } from '@code-expert/test-utils';
import { assert, describe, it } from 'vitest';

import {
  UnitInterval,
  clampUnitInterval,
  getEqAbsolute,
  stripTrailingZeroes,
  toFixed,
  toFixedZ,
  unitIntervalFromRange,
  unitIntervalToRange,
} from './number';

describe('prelude/number', () => {
  describe('stripTrailingZeroes()', () => {
    it('0 -> 0', () => {
      assert.equal(stripTrailingZeroes('0'), '0');
    });
    it('0.0000 -> 0', () => {
      assert.equal(stripTrailingZeroes('0.0000'), '0');
    });
    it('0.0100 -> 0.01', () => {
      assert.equal(stripTrailingZeroes('0.0100'), '0.01');
    });
    // Using `parseFloat` this would result in `7e-7`
    it('0.0000007 -> 0.0000007', () => {
      assert.equal(stripTrailingZeroes('0.0000007'), '0.0000007');
    });
  });

  describe('toFixed()', () => {
    it('rounds down', () => {
      assert.equal(toFixed(1)(0.04), '0.0');
    });
    it('rounds up', () => {
      assert.equal(toFixed(1)(0.05), '0.1');
    });
    it('expands scientific notation', () => {
      assert.equal(toFixed(7)(7e-7), '0.0000007');
    });
    it('clamps to min 0 digits', () => {
      assert.equal(toFixed(-1)(1.1), '1');
    });
    it('clamps to max 20 digits', () => {
      assert.equal(toFixed(21)(1e-21), '0.00000000000000000000');
    });
  });

  describe('toFixedZ()', () => {
    it('0.0000 -> 0', () => {
      assert.equal(toFixedZ(4)(0.0), '0');
    });
    it('0.0100 -> 0.01', () => {
      assert.equal(toFixedZ(4)(0.01), '0.01');
    });
    it('0.1 + 0.2 -> 0.3', () => {
      assert.equal(toFixedZ(4)(0.1 + 0.2), '0.3');
    });
  });

  describe('clampUnit', () => {
    it('0 -> 0', () => {
      assert.equal(clampUnitInterval(0), 0 as UnitInterval);
    });
    it('1 -> 1', () => {
      assert.equal(clampUnitInterval(1), 1 as UnitInterval);
    });
    it('-0.5 -> 0', () => {
      assert.equal(clampUnitInterval(-0.5), 0 as UnitInterval);
    });
    it('1.5 -> 0', () => {
      assert.equal(clampUnitInterval(1.5), 1 as UnitInterval);
    });
  });

  describe('toUnitFraction', () => {
    it('should stay within the unit interval bounds [0, 1]', () => {
      const isWithinUnitBoundsProperty = fc.property(
        fc.tuple(
          fc.float({ noDefaultInfinity: true, noNaN: true }),
          fc.float({ noDefaultInfinity: true, noNaN: true }),
          fc.float({ noNaN: true }),
        ),
        ([a, b, x]) => {
          const unit = unitIntervalFromRange(a, b)(x);
          return 0 <= unit && unit <= 1;
        },
      );
      fc.assert(isWithinUnitBoundsProperty);
    });
    it('[NaN, 0] -> TypeError', () => {
      assert.throws(() => unitIntervalFromRange(NaN, 0));
    });
    it('[0, NaN] ->  TypeError', () => {
      assert.throws(() => unitIntervalFromRange(0, NaN));
    });
    it('[0, 0] -> NaN -> TypeError', () => {
      assert.throws(() => unitIntervalFromRange(0, 0)(NaN));
    });
    it('[0, 0] -> 0 -> 0', () => {
      assert.equal(unitIntervalFromRange(0, 0)(0), 0);
    });
    it('[2, 6] -> 4 -> 0.5', () => {
      assert.equal(unitIntervalFromRange(2, 6)(4), 0.5);
    });
    it('[2, 6] -> 1 -> 0', () => {
      assert.equal(unitIntervalFromRange(2, 6)(1), 0);
    });
    it('[2, 6] -> 7 -> 1', () => {
      assert.equal(unitIntervalFromRange(2, 6)(7), 1);
    });
    it('[6, 2] -> 7 -> 0', () => {
      assert.equal(unitIntervalFromRange(6, 2)(7), 0);
    });
    it('[6, 2] -> 1 -> 1', () => {
      assert.equal(unitIntervalFromRange(6, 2)(1), 1);
    });
    it('[-2, 2] -> 1 -> 0.75', () => {
      assert.equal(unitIntervalFromRange(-2, 2)(1), 0.75);
    });
    it('[2, -2] -> -1 -> 0.75', () => {
      assert.equal(unitIntervalFromRange(2, -2)(-1), 0.75);
    });
  });

  describe('fromUnitFraction', () => {
    it('[2, 6] -> 0.5 -> 4', () => {
      assert.equal(unitIntervalToRange(2, 6)(0.5), 4);
    });
    it('[2, 6] -> -0.1 -> 2', () => {
      assert.equal(unitIntervalToRange(2, 6)(-0.1), 2);
    });
    it('[2, 6] -> 1.1 -> 6', () => {
      assert.equal(unitIntervalToRange(2, 6)(1.1), 6);
    });
  });

  describe('getEqAbsolute', () => {
    // Should be equal up to a 0.1 difference.
    const EqAbs = getEqAbsolute(0.1);
    it('should succeed for differences smaller than the precision', () => {
      assert.isTrue(EqAbs.equals(10, 10.09));
    });
    it('should fail for differences smaller than the precision', () => {
      assert.isFalse(EqAbs.equals(10, 10.11));
    });
  });
});
