/* eslint-env mocha */
import { describe, expect, it } from 'vitest';
import { iots } from '@code-expert/prelude';
import * as libPath from './Path';

describe('path', () => {
  describe('showPath', () => {
    const path: libPath.Path = [
      iots.brandFromLiteral('foo'),
      iots.brandFromLiteral('bar'),
      iots.brandFromLiteral('baz'),
    ];
    it('should work correctly', () => {
      expect(libPath.showPath.show(path)).toBe('foo/bar/baz');
    });
  });
});
