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

  describe('toPathSegment', () => {
    describe('should replace invalid characters from path', () => {
      it('should replace /', () => {
        expect(libPath.toPathSegment('/')).toBe('_');
      });
      it('should replace :', () => {
        expect(libPath.toPathSegment(':')).toBe('_');
      });
      it('should sanitize complex examples', () => {
        expect(libPath.toPathSegment('02 / Aufgabe 1: Python als Taschenrechner')).toBe(
          '02___Aufgabe_1__Python_als_Taschenrechner',
        );
        expect(libPath.toPathSegment('Modul 1A und 1B: Lernmaterialien')).toBe(
          'Modul_1A_und_1B__Lernmaterialien',
        );
      });
    });
  });
});
