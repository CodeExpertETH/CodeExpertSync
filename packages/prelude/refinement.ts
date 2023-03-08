import { refinement } from 'fp-ts';
import { Lazy } from 'fp-ts/function';

export * from 'fp-ts/Refinement';

export const orThrow =
  <A, B extends A>(r: refinement.Refinement<A, B>, e: Lazy<Error>) =>
  (a: A): B => {
    if (!r(a)) {
      throw e();
    }
    return a;
  };
