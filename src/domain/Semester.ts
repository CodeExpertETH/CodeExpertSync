import {
  adt,
  constant,
  either,
  eq,
  flow,
  iots,
  number,
  option,
  ord,
  pipe,
  show,
  string,
} from '@code-expert/prelude';

// FIXME Use domain/Semester from Code Expert Web instead

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

type Season = 'S' | 'A';

export interface Semester {
  season: Season;
  year: number;
}

//----------------------------------------------------------------------------------------------------------------------
// Utilities
//----------------------------------------------------------------------------------------------------------------------

const foldSeason = adt.foldFromKeys<Season>({ S: null, A: null });

const getSeasonCardinality = ({ season }: Semester) =>
  foldSeason(season, { S: constant(0), A: constant(1) });

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const eqSemester: eq.Eq<Semester> = eq.struct({
  season: string.Eq,
  year: number.Eq,
});

/**
 * Sort semesters, e.g. "AS19" or "SS17"
 */
export const ordSemesterIdAsc: ord.Ord<Semester> = ord.concatAll(
  ord.contramap((s: Semester) => s.year)(number.Ord),
  ord.contramap(getSeasonCardinality)(number.Ord),
);

export const showSemester: show.Show<Semester> = {
  show: ({ season, year }) => {
    const s = foldSeason(season, { S: constant('Spring'), A: constant('Autumn') });
    const y = year.toString();
    return `${s} semester ${y}`;
  },
};

//----------------------------------------------------------------------------------------------------------------------
// Codecs
//----------------------------------------------------------------------------------------------------------------------

const SeasonC: iots.Type<Season> = iots.union([iots.literal('S'), iots.literal('A')]);

const SeasonFromStringC: iots.Type<Season, string> = new iots.Type(
  'SeasonFromString',
  SeasonC.is,
  (u, context) =>
    pipe(
      iots.string.validate(u, context),
      either.chain((s) =>
        s === 'SS'
          ? either.of('S')
          : s === 'AS'
          ? either.of('A')
          : either.left([{ value: u, context, message: 'Invalid season' }]),
      ),
    ),
  foldSeason({ S: constant('SS'), A: constant('AS') }),
);

const YearFromStringC: iots.Type<number, string> = new iots.Type(
  'YearFromString',
  iots.NumberFromString.is,
  flow(iots.NumberFromString.validate, either.map(number.add(2000))),
  (y) => (y - 2000).toString().padStart(2, '0'),
);

const SemesterC: iots.Type<Semester> = iots.strict({
  season: SeasonC,
  year: iots.number,
});

export const SemesterFromStringC: iots.Type<Semester, string> = new iots.Type(
  'Semester',
  SemesterC.is,
  (u, c) =>
    pipe(
      iots.string.validate(u, c),
      either.chain(
        flow(
          string.splitAt(2),
          option.map(iots.success),
          option.getOrElse(() => iots.failure(u, c, 'Invalid semester')),
          either.chain(([s, y]) =>
            either.sequenceS({
              season: SeasonFromStringC.validate(s, c),
              year: YearFromStringC.validate(y, c),
            }),
          ),
        ),
      ),
    ),
  ({ season, year }) => SeasonFromStringC.encode(season) + YearFromStringC.encode(year),
);

//----------------------------------------------------------------------------------------------------------------------
// Domain functions
//----------------------------------------------------------------------------------------------------------------------
