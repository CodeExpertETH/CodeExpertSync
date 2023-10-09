import { Errors } from 'io-ts';
import { describe, expect, it } from 'vitest';
import { either } from '@code-expert/prelude';
import { Semester, SemesterFromStringC, showSemesterLong } from '@/domain/Semester';

describe('Semester', () => {
  describe('SemesterFromStringC', () => {
    const { encode, decode } = SemesterFromStringC;
    it('should correctly decode string representations', () => {
      type E = either.Either<Errors, Semester>;
      expect(decode('SS23')).toStrictEqual(either.right({ season: 'S', year: 2023 }));
      expect(decode('AS03')).toStrictEqual(either.right({ season: 'A', year: 2003 }));
      expect(decode('XS23')).toSatisfy<E>(either.isLeft);
    });
    it('should correctly encode semesters', () => {
      expect(encode({ season: 'S', year: 2023 })).toBe('SS23');
      expect(encode({ season: 'A', year: 2003 })).toBe('AS03');
    });
  });
  describe('showSemester', () => {
    it('should correctly render semesters', () => {
      const { show } = showSemesterLong;
      expect(show({ season: 'S', year: 2023 })).toBe('Spring semester 2023');
      expect(show({ season: 'A', year: 2003 })).toBe('Autumn semester 2003');
    });
  });
});
