import { Functor1, Functor2 } from 'fp-ts/Functor';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { functor, pipeable } from 'fp-ts';
import { constVoid, FunctionN } from 'fp-ts/function';

export * from 'fp-ts/Functor';

export type ToVoid = {
  <F extends URIS2>(F: Functor2<F>): <E, A>(a: Kind2<F, E, A>) => Kind2<F, E, void>;
  <F extends URIS>(F: Functor1<F>): <A>(a: Kind<F, A>) => Kind<F, void>;
};

export const toVoid: ToVoid =
  <F extends URIS>(F: Functor1<F>) =>
  <A>(a: Kind<F, A>): Kind<F, void> =>
    F.map(a, constVoid);

export type LiftedFunction2<F extends URIS2, E, A, B> = FunctionN<[Kind2<F, E, A>], Kind2<F, E, B>>;
export type LiftedFunction1<F extends URIS, A, B> = FunctionN<[Kind<F, A>], Kind<F, B>>;

export function lift<F extends URIS2, E>(
  F: functor.Functor2<F>,
): <A, B>(_: FunctionN<[A], B>) => LiftedFunction2<F, E, A, B>;
export function lift<F extends URIS>(
  F: functor.Functor1<F>,
): <A, B>(_: FunctionN<[A], B>) => LiftedFunction1<F, A, B>;
export function lift<F extends URIS>(
  F: functor.Functor1<F>,
): <A, B>(_: FunctionN<[A], B>) => LiftedFunction1<F, A, B> {
  return (f) => pipeable.pipeable(F).map(f);
}
