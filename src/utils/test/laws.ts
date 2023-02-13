import { Semigroup } from 'fp-ts/Semigroup';
import { Eq } from 'fp-ts/Eq';
import { fc } from "../test";

export * from 'fp-ts-laws';

/**
 * Test the commutativity property for types that are not full semirings.
 */
export const commutativity = <A>(S: Semigroup<A>, E: Eq<A>, arb: fc.Arbitrary<A>): void => {
  const property = fc.property(arb, arb, (a, b) => E.equals(S.concat(a, b), S.concat(b, a)));
  fc.assert(property);
};
