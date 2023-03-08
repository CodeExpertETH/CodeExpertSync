import * as separated from 'fp-ts/Separated';

export * from 'fp-ts/Separated';

export const toTuple = <E, A>(s: separated.Separated<E, A>): [E, A] => [s.left, s.right];
