import { fc } from '@code-expert/test-utils';
import { assert, describe, it } from 'vitest';
import { iots } from '@code-expert/prelude';
import { PfsPath, PfsPathBrand, isValidDirName, isValidFileName } from '@/domain/FileSystem';

const wordCharBuilders = [
  { num: 26, build: (v: number) => String.fromCharCode(v + 0x41) },
  { num: 26, build: (v: number) => String.fromCharCode(v + 0x61) },
  { num: 10, build: (v: number) => String.fromCharCode(v + 0x30) },
  { num: 1, build: () => String.fromCharCode(0x5f) },
];

const fsNodeCharBuilders = [
  ...wordCharBuilders,
  { num: 0, build: () => String.fromCharCode(0x20) },
  { num: 1, build: () => String.fromCharCode(0x2d) },
];

export const legalDirNameArb = fc.stringOf(fc.mapToConstant(...fsNodeCharBuilders), {
  minLength: 1,
  maxLength: 80,
});

export const legalFileNameArb = fc
  .tuple(
    fc.stringOf(fc.mapToConstant(...fsNodeCharBuilders), { minLength: 0, maxLength: 80 }),
    fc.constant('.'),
    fc.stringOf(fc.mapToConstant(...wordCharBuilders), { minLength: 1, maxLength: 5 }),
  )
  .map((elements) => elements.join(''));

// todo: it is unclear how many "collisions" this produces, we might need a better solution
export const pfsPathArb: fc.Arbitrary<PfsPath> = fc
  .tuple(fc.array(legalDirNameArb), legalFileNameArb)
  .map(([path, file]) => `./${path.join('/')}/${file}`)
  .map(iots.brandFromLiteral<string, PfsPathBrand>);

describe('PfsPath', () => {
  describe('legalDirNameArb', () => {
    it('should only produce strings that are accepted by isValidDirName', () => {
      fc.assert(fc.property(legalDirNameArb, (dirName) => assert.isTrue(isValidDirName(dirName))));
    });
  });
  describe('legalFileNameArb', () => {
    it('should only produce strings that are accepted by isValidFileName', () => {
      fc.assert(
        fc.property(legalFileNameArb, (fileName) => assert.isTrue(isValidFileName(fileName))),
      );
    });
  });
});
