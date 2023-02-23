import add from 'date-fns/fp/add';
import differenceInCalendarDays from 'date-fns/fp/differenceInCalendarDays';
import differenceInDays from 'date-fns/fp/differenceInDays';
import differenceInHours from 'date-fns/fp/differenceInHours';
import differenceInMilliseconds from 'date-fns/fp/differenceInMilliseconds';
import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import endOfDay from 'date-fns/fp/endOfDay';
import endOfMinute from 'date-fns/fp/endOfMinute';
import formatDuration from 'date-fns/fp/formatDuration';
import intervalToDuration from 'date-fns/fp/intervalToDuration';
import isAfter from 'date-fns/fp/isAfter';
import isBefore from 'date-fns/fp/isBefore';
import isDate_ from 'date-fns/fp/isDate';
import isEqual from 'date-fns/fp/isEqual';
import isSameDay from 'date-fns/fp/isSameDay';
import isSameHour from 'date-fns/fp/isSameHour';
import isWithinInterval from 'date-fns/fp/isWithinInterval';
import set from 'date-fns/fp/set';
import setDay from 'date-fns/fp/setDay';
import setHours from 'date-fns/fp/setHours';
import setMinutes from 'date-fns/fp/setMinutes';
import setSeconds from 'date-fns/fp/setSeconds';
import startOfDay from 'date-fns/fp/startOfDay';
import startOfMinute from 'date-fns/fp/startOfMinute';
import sub from 'date-fns/fp/sub';
import * as array from 'fp-ts/Array';
import * as date from 'fp-ts/Date';
import * as io from 'fp-ts/IO';
import { flow, pipe } from 'fp-ts/function';
import * as number from 'fp-ts/number';

import * as ord from './ord';

export * from 'fp-ts/Date';

export {
  add,
  sub,
  endOfMinute,
  formatDuration,
  intervalToDuration,
  differenceInCalendarDays,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInSeconds,
  isAfter,
  isEqual,
  isBefore,
  isSameDay,
  isSameHour,
  isWithinInterval,
  endOfDay,
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfMinute,
};

/**
 * Check whether a date is one or more calendar days after the given base date.
 */
export const isAfterCalendarDay = (base: Date) =>
  flow(differenceInCalendarDays(base), (diff) => diff > 0);

/**
 * Check whether a date is one or more calendar days before the given base date.
 */
export const isBeforeCalendarDay = (base: Date) =>
  flow(differenceInCalendarDays(base), (diff) => diff < 0);

/**
 * Check whether a date is between the given start and end hours (inclusive).
 */
export const isWithinTimeOfDayInterval =
  (minHours: number, maxHours: number) =>
  (x: Date): boolean => {
    const start = set({ hours: minHours, minutes: 0, seconds: 0, milliseconds: 0 })(x);
    const end = set({ hours: maxHours, minutes: 0, seconds: 0, milliseconds: 0 })(x);
    return isWithinInterval({ start, end })(x);
  };

/**
 * Check if a value is a Date.
 */
export const isDate = (x: unknown): x is Date => isDate_(x);

/**
 * Create a date at the start of the current day.
 */
export const atStartOfDay = pipe(date.create, io.map(startOfDay));

/**
 * Create a date at the end of the current day.
 */
export const atEndOfDay = pipe(date.create, io.map(endOfDay));

/**
 * Make a date precise to the minute, stripping out seconds and below.
 */
export const precisionMinute = set({ seconds: 0, milliseconds: 0 });

type DurationElement = keyof Duration;
export const getSignificantElements =
  (precision: number) =>
  (duration: Duration): Array<DurationElement> => {
    const elements: Array<DurationElement> = [
      'years',
      'months',
      'weeks',
      'days',
      'hours',
      'minutes',
      'seconds',
    ];
    return pipe(
      elements,
      array.dropLeftWhile((e) => {
        const value = duration[e];
        return value == null || value == 0;
      }),
      array.takeLeft(precision),
    );
  };

/**
 * Given two dates, return the date that comes later in time.
 */
export const max = ord.max(date.Ord);

const intervalToMilliseconds: (interval: Interval) => number = ({ start, end }) => {
  const startT = number.isNumber(start) ? start : start.getTime();
  const endT = number.isNumber(end) ? end : end.getTime();
  return endT - startT;
};
export const ordInterval = ord.contramap(intervalToMilliseconds)(number.Ord);

export const ordNullable: ord.Ord<Date | undefined> = ord.getNullable(date.Ord);

export const ordStartOfMinute = pipe(date.Ord, ord.contramap(precisionMinute));

/**
 * Given a date, set its year, month and day of month to those of the given source date.
 */
export const setCalendarDay = (source: Date) =>
  set({
    year: source.getFullYear(),
    month: source.getMonth(),
    date: source.getDate(),
  });

/**
 * Given a date, set its hours, minutes, seconds and milliseconds to those of the given source date.
 */
export const setTimeOfDay = (source: Date) =>
  set({
    hours: source.getHours(),
    minutes: source.getMinutes(),
    seconds: source.getSeconds(),
    milliseconds: source.getMilliseconds(),
  });
