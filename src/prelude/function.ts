/* eslint-disable prefer-destructuring */
import * as F from 'fp-ts/function';

export type { FunctionN, Lazy } from 'fp-ts/function';
export { not, or } from 'fp-ts/Predicate';
export type { Predicate } from 'fp-ts/Predicate';
export type { Refinement } from 'fp-ts/Refinement';

export const absurd = F.absurd;

export const constant = F.constant;
export const constFalse = F.constFalse;
export const constNull = F.constNull;
export const constTrue = F.constTrue;
export const constUndefined = F.constUndefined;
export const constVoid = F.constVoid;

export const identity = F.identity;

export const flow = F.flow;

/**
 * Pipe is used to create transformation pipelines for the values we work with.
 * It works similar to a fluent interface we know from jQuery but composes
 * functions instead. Due to the way TypeScript’s type inference works, pipe
 * works from left to right, i.e. the first argument determines the initial
 * type that will then be transformed in the rest of the pipeline.
 *
 * @example
 * const four = pipe(
 *   2,
 *   (x) => x * x
 * )
 */
export const pipe = F.pipe;

const tryCatchK: <A, B>(fn: (a: A) => B, onThrow: (e: unknown) => B) => (a: A) => B =
  (fn, onThrow) => (a) => {
    try {
      return fn(a);
    } catch (e) {
      return onThrow(e);
    }
  };

const tryCatchKW: <A, B, C>(fn: (a: A) => B, onThrow: (e: unknown) => C) => (a: A) => B | C =
  (fn, onThrow) => (a) => {
    try {
      return fn(a);
    } catch (e) {
      return onThrow(e);
    }
  };

export const fn = {
  tuple: F.tuple,
  tupled: F.tupled,
  untupled: F.untupled,
  tryCatchK,
  tryCatchKW,
};
