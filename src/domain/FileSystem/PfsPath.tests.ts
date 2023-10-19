import { assert, describe, expect, it } from 'vitest';
import { either, iots, option, pipe } from '@code-expert/prelude';
import { PfsPath, PfsPathFromStringC, getPfsParent, pfsBasename, showPfsPath } from './PfsPath';

const mkPfsPath = (s: string): PfsPath => {
  const path = PfsPathFromStringC.decode(s);
  if (!either.isRight(path)) return expect.fail(`Invalid PFS path: ${s}`);
  return path.right;
};

describe('PfsPath', () => {
  describe('PfsPathFromStringC', () => {
    it('should correctly decode string representations', () => {
      type V = iots.Validation<PfsPath>;
      expect(PfsPathFromStringC.decode('.')).toStrictEqual(either.right([]));
      expect(PfsPathFromStringC.decode('./foo/bar')).toStrictEqual(either.right(['foo', 'bar']));
      expect(PfsPathFromStringC.decode('/foo/bar')).toSatisfy<V>(either.isLeft);
      expect(PfsPathFromStringC.decode('foo/bar')).toSatisfy<V>(either.isLeft);
    });

    it('should correctly encode paths', () => {
      expect(PfsPathFromStringC.encode(mkPfsPath('.'))).toStrictEqual('.');
      expect(PfsPathFromStringC.encode(mkPfsPath('./foo/bar'))).toStrictEqual('./foo/bar');
    });
  });

  describe('getPfsParent', () => {
    it('should strip the last path segment', () => {
      const path = mkPfsPath('./foo/bar/baz');
      const parentPathO = pipe(getPfsParent(path), option.map(showPfsPath.show));
      expect(parentPathO).toStrictEqual(option.some('./foo/bar'));
    });
  });

  describe('basename', () => {
    it('should return an empty basename for an empty path', () => {
      assert.deepStrictEqual(pfsBasename(parse('.')), option.none);
    });

    it('should return the filename portion of the path', () => {
      assert.deepStrictEqual(pfsBasename(parse('./test.txt')), option.some('test.txt'));
      assert.deepStrictEqual(pfsBasename(parse('./folder/test.txt')), option.some('test.txt'));
      assert.deepStrictEqual(pfsBasename(parse('./a/b/c')), option.some('c'));
    });

    const parse = (path: string): PfsPath =>
      pipe(
        PfsPathFromStringC.decode(path),
        either.getOrElseW((errs) => {
          throw new Error(`Invalid path: ${iots.formatValidationErrors(errs).join('; ')}`);
        }),
      );
  });
});
