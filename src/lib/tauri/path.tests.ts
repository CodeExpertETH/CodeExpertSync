/* eslint-env mocha */
import { describe, expect, it } from 'vitest';
import * as libPath from './path';

describe('libPath.escape', () => {
  describe('should replace invalid characters from path', () => {
    it('should replace /', () => {
      expect(libPath.escape('/')).toBe('_');
    });
    it('should replace :', () => {
      expect(libPath.escape(':')).toBe('_');
    });
  });
  describe('should replace invalid characters from path', () => {
    it('should replace complex example', () => {
      expect(libPath.escape('02 / Aufgabe 1: Python als Taschenrechner')).toBe(
        '02___Aufgabe_1__Python_als_Taschenrechner',
      );
    });
    it('should replace other example', () => {
      expect(libPath.escape('Modul 1A und 1B: Lernmaterialien')).toBe(
        'Modul_1A_und_1B__Lernmaterialien',
      );
    });
  });
});
