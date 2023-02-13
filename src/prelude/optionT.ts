import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { functor, monad, optionT, pipeable, predicate } from 'fp-ts';
import { flow, FunctionN, Lazy } from 'fp-ts/function';
import * as option from './option';

export * from 'fp-ts/OptionT';

export function exists<F extends URIS2, E>(
  F: functor.Functor2<F>,
): <A>(
  _: predicate.Predicate<A>,
) => FunctionN<[Kind2<F, E, option.Option<A>>], Kind2<F, E, boolean>>;
export function exists<F extends URIS>(
  F: functor.Functor1<F>,
): <A>(_: predicate.Predicate<A>) => FunctionN<[Kind<F, option.Option<A>>], Kind<F, boolean>>;
export function exists<F extends URIS>(
  F: functor.Functor1<F>,
): <A>(_: predicate.Predicate<A>) => FunctionN<[Kind<F, option.Option<A>>], Kind<F, boolean>> {
  return (p) => pipeable.pipeable(F).map(option.exists(p));
}

export function isNone<F extends URIS2, E>(
  F: functor.Functor2<F>,
): <A>(_: Kind2<F, E, option.Option<A>>) => Kind2<F, E, boolean>;
export function isNone<F extends URIS>(
  F: functor.Functor1<F>,
): <A>(_: Kind<F, option.Option<A>>) => Kind<F, boolean>;
export function isNone<F extends URIS>(
  F: functor.Functor1<F>,
): <A>(_: Kind<F, option.Option<A>>) => Kind<F, boolean> {
  return pipeable.pipeable(F).map((o) => option.isNone(o));
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FromBooleanF = {
  /**
   * Create an F of an optional value based on an F of a condition.
   * Lazy<A> => F<boolean> => F<Option<A>>
   */
  <F extends URIS2>(F: functor.Functor2<F>): <A>(
    a: Lazy<A>,
  ) => <E>(_: Kind2<F, E, boolean>) => Kind2<F, E, option.Option<A>>;
  /**
   * Create an F of an optional value based on an F of a condition.
   * Lazy<A> => F<boolean> => F<Option<A>>
   */
  <F extends URIS>(F: functor.Functor1<F>): <A>(
    a: Lazy<A>,
  ) => (_: Kind<F, boolean>) => Kind<F, option.Option<A>>;
};

export const fromBooleanF: FromBooleanF = <F extends URIS>(F: functor.Functor1<F>) =>
  flow(option.fromBoolean, pipeable.pipeable(F).map);

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

/**
 * Chain operation over the transformed (outer) monad.
 */
export function semiChain<F extends URIS2>(
  F: monad.Monad2<F>,
): <E, A, B>(
  f: (a: A) => Kind2<F, E, B>,
) => (fa: optionT.OptionT2<F, E, A>) => optionT.OptionT2<F, E, B>;
export function semiChain<F extends URIS>(
  F: monad.Monad1<F>,
): <A, B>(f: (a: A) => Kind<F, B>) => (fa: optionT.OptionT1<F, A>) => optionT.OptionT1<F, B>;
export function semiChain<F extends URIS>(
  F: monad.Monad1<F>,
): <A, B>(f: (a: A) => Kind<F, B>) => (fa: optionT.OptionT1<F, A>) => optionT.OptionT1<F, B> {
  return (f) =>
    optionT.chain(F)(
      flow(
        f,
        pipeable.pipeable(F).map((b) => option.of(b)),
      ),
    );
}
