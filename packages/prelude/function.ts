/* eslint-disable prefer-destructuring */
import * as F from 'fp-ts/function';

export type { FunctionN, Lazy, LazyArg } from 'fp-ts/function';
export {
  absurd,
  constant,
  constFalse,
  constNull,
  constTrue,
  constUndefined,
  constVoid,
  flow,
  identity,
  pipe,
} from 'fp-ts/function';
export { not, or } from 'fp-ts/Predicate';
export type { Predicate } from 'fp-ts/Predicate';
export type { Refinement } from 'fp-ts/Refinement';

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
