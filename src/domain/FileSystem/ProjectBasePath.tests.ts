/* eslint-env mocha */
import { describe, expect, it } from 'vitest';
import { mkProjectBasePathSegment } from '@/domain/FileSystem/ProjectBasePath';

describe('path', () => {
  describe('toPathSegment', () => {
    describe('should replace invalid characters from path', () => {
      it('should replace /', () => {
        expect(mkProjectBasePathSegment('/')).toBe('_');
      });
      it('should replace :', () => {
        expect(mkProjectBasePathSegment(':')).toBe('_');
      });
      it('should sanitize complex examples', () => {
        expect(mkProjectBasePathSegment('02 / Aufgabe 1: Python als Taschenrechner')).toBe(
          '02___Aufgabe_1__Python_als_Taschenrechner',
        );
        expect(mkProjectBasePathSegment('Modul 1A und 1B: Lernmaterialien')).toBe(
          'Modul_1A_und_1B__Lernmaterialien',
        );
      });
    });
  });
});
