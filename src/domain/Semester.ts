import { number, ord } from '@code-expert/prelude';

// FIXME Use domain/Semester from Code Expert Web instead

const getSeasonCardinality = (id: string) => (id.substring(0, 2) === 'SS' ? 0 : 1);

const getYear = (id: string) => (id === 'p' ? 0 : parseInt(id.substring(2, 4), 10));

/**
 * Sort semesters, e.g. "AS19" or "SS17"
 */
export const ordSemesterIdAsc = ord.concatAll<string>(
  ord.contramap(getYear)(number.Ord),
  ord.contramap(getSeasonCardinality)(number.Ord),
);
