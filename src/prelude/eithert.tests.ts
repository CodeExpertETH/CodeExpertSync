import { option, string } from 'fp-ts';
import { assert, describe, it } from 'vitest';
import * as eitherT from './eithert';
import * as ioEither from './io-either';
import { pipe } from 'fp-ts/function';

describe('prelude/eitherT', () => {
  describe('sequence2', () => {
    const right = <A>(a: A) => eitherT.right(option.Pointed)<A, string>(a);
    const left = (e: string) => eitherT.left(option.Pointed)(e);
    it('should work for two rights', () => {
      const result = eitherT.sequence2(option.Applicative)(right('a'), right('b'));
      assert.deepStrictEqual(result, right(['a', 'b']));
    });
    it('should work for right and a left', () => {
      const result = eitherT.sequence2(option.Applicative)(right('a'), left('error'));
      assert.deepStrictEqual(result, left('error'));
    });
  });
  describe('map2', () => {
    it('should work for kind 1', () => {
      const F = option.Monad;
      const result = eitherT.map2(F)(eitherT.of(F)('a'), eitherT.of(F)('b'))(
        string.Semigroup.concat,
      );
      assert.deepStrictEqual(result, eitherT.of(F)('ab'));
    });
    it('should work for kind 2', () => {
      const F = ioEither.Monad;
      const result = eitherT.map2(F)(eitherT.of(F)('a'), eitherT.of(F)('b'))(
        string.Semigroup.concat,
      );
      assert.deepStrictEqual(ioEither.run(result), ioEither.run(eitherT.of(F)('ab')));
    });
  });
  describe('semiChain', () => {
    it('should work for kind 1', () => {
      const result = pipe(
        eitherT.of(option.Pointed)('a'),
        eitherT.semiChain(option.Monad)((a) => option.of(a + a)),
      );
      assert.deepStrictEqual(result, eitherT.of(option.Pointed)('aa'));
    });
  });
  describe('semiChainFirst', () => {
    it('should work for kind 1', () => {
      const result = pipe(
        eitherT.of(option.Pointed)('a'),
        eitherT.semiChainFirst(option.Monad)((a) => option.of(a + a)),
      );
      assert.deepStrictEqual(result, eitherT.of(option.Pointed)('a'));
    });
  });
});
