import { describe, expect, it } from 'vitest';
import { either } from '@code-expert/prelude';
import { PfsDir, PfsFile, isExcludedFromPfs } from '@/domain/FileSystem/PfsNode';
import { PfsPath, PfsPathFromStringC } from './PfsPath';

const mkPfsPath = (s: string): PfsPath => {
  const path = PfsPathFromStringC.decode(s);
  if (!either.isRight(path)) return expect.fail(`Invalid PFS path: ${s}`);
  return path.right;
};

const mkPfsFile = (s: string): PfsFile => {
  const path = mkPfsPath(s);
  return { type: 'file', path };
};

const mkPfsDir = (s: string): PfsDir => {
  const path = mkPfsPath(s);
  return { type: 'dir', path };
};

describe('PfsNode', () => {
  describe('isExcludedFromPfs', () => {
    it('should not exclude expected files', () => {
      expect(isExcludedFromPfs(mkPfsFile('./config.json'))).toBeFalsy();
      expect(isExcludedFromPfs(mkPfsFile('./readme.md'))).toBeFalsy();
    });

    it('should not exclude expected directories', () => {
      expect(isExcludedFromPfs(mkPfsDir('.'))).toBeFalsy();
      expect(isExcludedFromPfs(mkPfsDir('./supdir/subdir'))).toBeFalsy();
    });

    it('should exclude files starting with a dot', () => {
      expect(isExcludedFromPfs(mkPfsFile('./.gitignore'))).toBeTruthy();
    });

    it('should exclude files ending with tilde (Emacs/vim backup files)', () => {
      expect(isExcludedFromPfs(mkPfsFile('./readme.md~'))).toBeTruthy();
    });

    it('should exclude directories starting with a dot', () => {
      expect(isExcludedFromPfs(mkPfsDir('./.idea'))).toBeTruthy();
      expect(isExcludedFromPfs(mkPfsDir('./stuff/.git'))).toBeTruthy();
    });
  });
});
