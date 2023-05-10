/* eslint-env mocha */
import { describe, expect, it } from 'vitest';
import { pathEscape } from '@/utils/pathEscape';

describe('pathEscape.ts', () => {
  describe('should replace invalid characters from path', () => {
    it('should replace /', () => {
      expect(pathEscape('/')).toBe('_');
    });
    it('should replace :', () => {
      expect(pathEscape(':')).toBe('_');
    });
  });
  describe('should replace invalid characters from path', () => {
    it('should replace complex example', () => {
      expect(pathEscape('02 / Aufgabe 1: Python als Taschenrechner')).toBe(
        '02___Aufgabe_1__Python_als_Taschenrechner',
      );
    });
    it('should replace other example', () => {
      expect(pathEscape('Modul 1A und 1B: Lernmaterialien')).toBe(
        'Modul_1A_und_1B__Lernmaterialien',
      );
    });
  });
});
