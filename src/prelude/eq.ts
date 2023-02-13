import * as eq from 'fp-ts/Eq';
import { constTrue } from 'fp-ts/function';

export * from 'fp-ts/Eq';

export const trivial: eq.Eq<unknown> = {
  equals: constTrue,
};
