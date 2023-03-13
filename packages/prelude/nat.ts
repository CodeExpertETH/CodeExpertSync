import * as iots from 'io-ts';

/**
 * Refinement type for natural numbers
 */

export interface NatBrand {
  readonly Nat: unique symbol;
}
export const Nat = iots.brand(
  iots.number,
  (n): n is iots.Branded<number, NatBrand> => Number.isInteger(n) && n >= 0,
  'Nat',
);
export type Nat = iots.TypeOf<typeof Nat>;
