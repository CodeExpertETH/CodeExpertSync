import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { apply, functor, monad, option, pipeable, pointed, predicate } from 'fp-ts';
import { Endomorphism } from 'fp-ts/Endomorphism';
import { flow, FunctionN, Lazy, pipe, tupled } from 'fp-ts/function';
import { Applicative1, Applicative2 } from 'fp-ts/Applicative';
import * as eitherT from 'fp-ts/EitherT';
import { EitherT1, EitherT2 } from 'fp-ts/EitherT';
import * as either from './either';

export * from 'fp-ts/EitherT';

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type Sequence2 = {
  /**
   * Tuple sequencing; executes two monadic computations and combines the results as a tuple.
   */
  <F extends URIS2>(F: Applicative2<F>): <FE, E, A, B>(
    a: EitherT2<F, FE, E, A>,
    b: EitherT2<F, FE, E, B>,
  ) => EitherT2<F, FE, E, [A, B]>;
  /**
   * Tuple sequencing; executes two monadic computations and combines the results as a tuple.
   */
  <F extends URIS>(F: Applicative1<F>): <E, A, B>(
    a: EitherT1<F, E, A>,
    b: EitherT1<F, E, B>,
  ) => EitherT1<F, E, [A, B]>;
};

export const sequence2: Sequence2 =
  <F extends URIS>(F: Applicative1<F>) =>
  <E, A, B>(a: EitherT1<F, E, A>, b: EitherT1<F, E, B>) => {
    const FS = pipeable.pipeable(F);
    const seq: (ea: either.Either<E, A>) => (eb: either.Either<E, B>) => either.Either<E, [A, B]> =
      (ea) => (eb) =>
        apply.sequenceT(either.Apply)(ea, eb);
    return pipe(F.of(seq), FS.ap(a), FS.ap(b));
  };

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type Map2 = {
  /**
   * Executes two monadic computations and applies a function to the result.
   */
  <F extends URIS2>(F: Applicative2<F>): <FE, E, A, B>(
    a: EitherT2<F, FE, E, A>,
    b: EitherT2<F, FE, E, B>,
  ) => <R>(f: FunctionN<[A, B], R>) => EitherT2<F, FE, E, R>;
  /**
   * Executes two monadic computations and applies a function to the result.
   */
  <F extends URIS>(F: Applicative1<F>): <E, A, B>(
    a: EitherT1<F, E, A>,
    b: EitherT1<F, E, B>,
  ) => <R>(f: FunctionN<[A, B], R>) => EitherT1<F, E, R>;
};

export const map2: Map2 =
  <F extends URIS>(F: Applicative1<F>) =>
  <E, A, B>(a: EitherT1<F, E, A>, b: EitherT1<F, E, B>) =>
  <R>(f: FunctionN<[A, B], R>) =>
    pipe(sequence2(F)(a, b), eitherT.map(F)(tupled(f)));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type Of = {
  <F extends URIS2, FE>(F: pointed.Pointed2<F>): <E, A>(a: A) => EitherT2<F, FE, E, A>;
  <F extends URIS>(F: pointed.Pointed1<F>): <E, A>(a: A) => EitherT1<F, E, A>;
};

export const of: Of = <F extends URIS>(F: pointed.Pointed1<F>) => eitherT.right(F);

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FilterOrElse = {
  /**
   * Filters a value based on a predicate.
   */
  <F extends URIS2>(F: functor.Functor2<F>): <FE, E, A>(
    p: predicate.Predicate<A>,
    onFalse: Lazy<E>,
  ) => Endomorphism<EitherT2<F, FE, E, A>>;
  /**
   * Filters a value based on a predicate.
   */
  <F extends URIS>(F: functor.Functor1<F>): <E, A>(
    p: predicate.Predicate<A>,
    onFalse: Lazy<E>,
  ) => Endomorphism<EitherT1<F, E, A>>;
};

export const filterOrElse: FilterOrElse =
  <F extends URIS>(F: functor.Functor1<F>) =>
  <E, A>(p: predicate.Predicate<A>, onFalse: Lazy<E>): Endomorphism<EitherT1<F, E, A>> =>
    pipeable.pipeable(F).map(either.filterOrElse(p, onFalse));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FilterOrElseM = {
  /**
   * Filters a value based on a monadic predicate.
   */
  <F extends URIS2>(F: monad.Monad2<F>): <FE, E, A>(
    p: FunctionN<[A], Kind2<F, FE, boolean>>,
    onFalse: Lazy<E>,
  ) => Endomorphism<EitherT2<F, FE, E, A>>;
  /**
   * Filters a value based on a monadic predicate.
   */
  <F extends URIS>(F: monad.Monad1<F>): <E, A>(
    p: FunctionN<[A], Kind<F, boolean>>,
    onFalse: Lazy<E>,
  ) => Endomorphism<EitherT1<F, E, A>>;
};

export const filterOrElseM: FilterOrElseM =
  <F extends URIS>(F: monad.Monad1<F>) =>
  <E, A>(
    p: FunctionN<[A], Kind<F, boolean>>,
    onFalse: Lazy<E>,
  ): Endomorphism<EitherT1<F, E, A>> => {
    const FF = pipeable.pipeable(F);
    return FF.chain(
      either.fold<E, A, EitherT1<F, E, A>>(eitherT.left(F), (a) =>
        pipe(p(a), FF.map(either.fromBoolean(onFalse, () => a))),
      ),
    );
  };

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FromPredicate = {
  <F extends URIS2>(F: pointed.Pointed2<F>): <E, A>(
    p: predicate.Predicate<A>,
    onFalse: Lazy<E>,
  ) => <FE>(_: A) => EitherT2<F, FE, E, A>;
  <F extends URIS>(F: pointed.Pointed1<F>): <E, A>(
    p: predicate.Predicate<A>,
    onFalse: Lazy<E>,
  ) => (_: A) => EitherT1<F, E, A>;
};

export const fromPredicate: FromPredicate =
  <F extends URIS>(F: pointed.Pointed1<F>) =>
  <E, A>(p: predicate.Predicate<A>, onFalse: Lazy<E>): ((_: A) => EitherT1<F, E, A>) =>
    flow(either.fromPredicate(p, onFalse), (e) => F.of(e));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type ChainFirst = {
  /**
   * Chain operation which discards the resulting value and returns the original value.
   */
  <F extends URIS2>(F: monad.Monad2<F>): <FE, E, A, B>(
    _: FunctionN<[A], EitherT2<F, FE, E, B>>,
  ) => Endomorphism<EitherT2<F, FE, E, A>>;
  /**
   * Chain operation which discards the resulting value and returns the original value.
   */
  <F extends URIS>(F: monad.Monad1<F>): <E, A, B>(
    _: FunctionN<[A], EitherT1<F, E, B>>,
  ) => Endomorphism<EitherT1<F, E, A>>;
};

export const chainFirst: ChainFirst =
  <F extends URIS>(
    F: monad.Monad1<F>,
  ): (<E, A, B>(_: FunctionN<[A], EitherT1<F, E, B>>) => Endomorphism<EitherT1<F, E, A>>) =>
  (f) =>
    eitherT.chain(F)((a) =>
      pipe(
        f(a),
        eitherT.map(F)(() => a),
      ),
    );

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type SemiChain = {
  /**
   * Chain operation over the transformed (outer) monad.
   * @example
   * pipe(
   *   eitherT.of(option.Pointed)('a'),
   *   eitherT.semiChain(option.Monad)((a) => option.of(a + a)),
   * ); // either.right(option.some('aa'))
   */
  <F extends URIS2>(F: monad.Monad2<F>): <FE, E, A, B>(
    _: FunctionN<[A], Kind2<F, FE, B>>,
  ) => FunctionN<[EitherT2<F, FE, E, A>], EitherT2<F, FE, E, B>>;
  /**
   * Chain operation over the transformed (outer) monad.
   * @example
   * pipe(
   *   eitherT.of(option.Pointed)('a'),
   *   eitherT.semiChain(option.Monad)((a) => option.of(a + a)),
   * ); // either.right(option.some('aa'))
   */
  <F extends URIS>(F: monad.Monad1<F>): <E, A, B>(
    _: FunctionN<[A], Kind<F, B>>,
  ) => FunctionN<[EitherT1<F, E, A>], EitherT1<F, E, B>>;
};

export const semiChain: SemiChain =
  <F extends URIS>(
    F: monad.Monad1<F>,
  ): (<E, A, B>(
    _: FunctionN<[A], Kind<F, B>>,
  ) => FunctionN<[EitherT1<F, E, A>], EitherT1<F, E, B>>) =>
  (f) =>
    eitherT.chain(F)(
      flow(
        f,
        pipeable.pipeable(F).map((b) => either.of(b)),
      ),
    );

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type SemiChainFirst = {
  /**
   * Chain operation over the transformed (outer) monad which discards the resulting value and returns
   * the original value.
   * @example
   * pipe(
   *   eitherT.of(option.Pointed)('a'),
   *   eitherT.semiChain(option.Monad)((a) => option.of(a + a)),
   * ); // either.right(option.some('a'))
   */
  <F extends URIS2>(F: monad.Monad2<F>): <FE, E, A, B>(
    _: FunctionN<[A], Kind2<F, FE, B>>,
  ) => Endomorphism<EitherT2<F, FE, E, A>>;
  /**
   * Chain operation over the transformed (outer) monad which discards the resulting value and returns
   * the original value.
   * @example
   * pipe(
   *   eitherT.of(option.Pointed)('a'),
   *   eitherT.semiChain(option.Monad)((a) => option.of(a + a)),
   * ); // either.right(option.some('a'))
   */
  <F extends URIS>(F: monad.Monad1<F>): <E, A, B>(
    _: FunctionN<[A], Kind<F, B>>,
  ) => Endomorphism<EitherT1<F, E, A>>;
};

export const semiChainFirst: SemiChainFirst =
  <F extends URIS>(
    F: monad.Monad1<F>,
  ): (<E, A, B>(_: FunctionN<[A], Kind<F, B>>) => Endomorphism<EitherT1<F, E, A>>) =>
  (f) =>
    semiChain(F)((a) =>
      pipe(
        f(a),
        pipeable.pipeable(F).map(() => a),
      ),
    );

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FromOptionF = {
  /**
   * Create an F of an either based on an F of an option.
   * Lazy<E> => F<Option<A>> => F<Either<E, A>>
   */
  <F extends URIS2>(F: functor.Functor2<F>): <FE, E>(
    onNone: Lazy<E>,
  ) => <A>(_: Kind2<F, FE, option.Option<A>>) => EitherT2<F, FE, E, A>;
  /**
   * Create an F of an either based on an F of an option.
   * Lazy<E> => F<Option<A>> => F<Either<E, A>>
   */
  <F extends URIS>(F: functor.Functor1<F>): <E>(
    onNone: Lazy<E>,
  ) => <A>(_: Kind<F, option.Option<A>>) => EitherT1<F, E, A>;
};

export const fromOptionF: FromOptionF =
  <F extends URIS>(F: functor.Functor1<F>) =>
  <E>(onNone: Lazy<E>) =>
    pipeable.pipeable(F).map(either.fromOption(onNone));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

type FromBooleanF = {
  /**
   * Create an F of an either based on an F of a condition.
   * (Lazy<E>, Lazy<A>) => F<boolean> => F<Either<E, A>>
   */
  <F extends URIS2>(F: functor.Functor2<F>): <FE, E, A>(
    onFalse: Lazy<E>,
    onTrue: Lazy<A>,
  ) => (_: Kind2<F, FE, boolean>) => EitherT2<F, FE, E, A>;
  /**
   * Create an F of an either based on an F of a condition.
   * (Lazy<E>, Lazy<A>) => F<boolean> => F<Either<E, A>>
   */
  <F extends URIS>(F: functor.Functor1<F>): <E, A>(
    onFalse: Lazy<E>,
    onTrue: Lazy<A>,
  ) => <A>(_: Kind<F, boolean>) => EitherT1<F, E, A>;
};

export const fromBooleanF: FromBooleanF =
  <F extends URIS>(F: functor.Functor1<F>) =>
  <E, A>(onFalse: Lazy<E>, onTrue: Lazy<A>) =>
    pipeable.pipeable(F).map(either.fromBoolean(onFalse, onTrue));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
