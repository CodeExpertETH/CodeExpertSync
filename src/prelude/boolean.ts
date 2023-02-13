import { predicate } from 'fp-ts';
import { FunctionN } from 'fp-ts/function';

export * from 'fp-ts/boolean';

export const equals: FunctionN<[boolean], predicate.Predicate<boolean>> = (expected) => (actual) =>
  expected === actual;

export const isFalse = (x: boolean): boolean => !x;

export const isTrue = (x: boolean): boolean => x;
