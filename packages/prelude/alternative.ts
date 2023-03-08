import * as alternative from 'fp-ts/Alternative';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';

import * as alt from './alt';

export * from 'fp-ts/Alternative';

export function altAllBy<F extends URIS2>(
  F: alternative.Alternative2<F>,
): <A, E, B>(...fs: NonEmptyArray<(a: A) => Kind2<F, E, B>>) => (a: A) => Kind2<F, E, B>;
export function altAllBy<F extends URIS2, E>(
  F: alternative.Alternative2C<F, E>,
): <A, B>(...fs: NonEmptyArray<(a: A) => Kind2<F, E, B>>) => (a: A) => Kind2<F, E, B>;
export function altAllBy<F extends URIS>(
  F: alternative.Alternative1<F>,
): <A, B>(...fs: NonEmptyArray<(a: A) => Kind<F, B>>) => (a: A) => Kind<F, B>;
export function altAllBy<F>(
  F: alternative.Alternative<F>,
): <A, B>(...fs: NonEmptyArray<(a: A) => HKT<F, B>>) => (a: A) => HKT<F, B>;
export function altAllBy<F>(
  F: alternative.Alternative<F>,
): <A, B>(...fs: NonEmptyArray<(a: A) => HKT<F, B>>) => (a: A) => HKT<F, B> {
  return alt.altAllBy(F)(F.zero());
}
