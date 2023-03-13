import * as alt from 'fp-ts/Alt';
import { HKT, Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';

export * from 'fp-ts/Alt';

export function altAllBy<F extends URIS2>(
  F: alt.Alt2<F>,
): <E, B>(
  startWith: Kind2<F, E, B>,
) => <A>(...fs: NonEmptyArray<(a: A) => Kind2<F, E, B>>) => (a: A) => Kind2<F, E, B>;
export function altAllBy<F extends URIS2, E>(
  F: alt.Alt2C<F, E>,
): <B>(
  startWith: Kind2<F, E, B>,
) => <A>(...fs: NonEmptyArray<(a: A) => Kind2<F, E, B>>) => (a: A) => Kind2<F, E, B>;
export function altAllBy<F extends URIS>(
  F: alt.Alt1<F>,
): <B>(
  startWith: HKT<F, B>,
) => <A>(...fs: NonEmptyArray<(a: A) => Kind<F, B>>) => (a: A) => Kind<F, B>;
export function altAllBy<F>(
  F: alt.Alt<F>,
): <B>(
  startWith: HKT<F, B>,
) => <A>(...fs: NonEmptyArray<(a: A) => HKT<F, B>>) => (a: A) => HKT<F, B>;
export function altAllBy<F>(
  F: alt.Alt<F>,
): <B>(
  startWith: HKT<F, B>,
) => <A>(...fs: NonEmptyArray<(a: A) => HKT<F, B>>) => (a: A) => HKT<F, B> {
  return (startWith) =>
    (...fs) =>
    (a) =>
      fs.reduce((mb, f) => F.alt(mb, () => f(a)), startWith);
}
