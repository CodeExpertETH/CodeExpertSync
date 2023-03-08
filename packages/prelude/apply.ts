import { $IntentionalAny } from '@code-expert/type-utils';
import { pipeable } from 'fp-ts';
import * as apply from 'fp-ts/Apply';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { FunctionN, pipe, tupled } from 'fp-ts/function';

export * from 'fp-ts/Apply';

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export type Sequence2 = {
  /**
   * Tuple sequencing; executes two monadic computations and combines the results as a tuple.
   */
  <F extends URIS2>(F: apply.Apply2<F>): <E, A, B>(
    a: Kind2<F, E, A>,
    b: Kind2<F, E, B>,
  ) => Kind2<F, E, [A, B]>;
  /**
   * Tuple sequencing; executes two monadic computations and combines the results as a tuple.
   */
  <F extends URIS>(F: apply.Apply1<F>): <A, B>(a: Kind<F, A>, b: Kind<F, B>) => Kind<F, [A, B]>;
};

export const sequence2: Sequence2 =
  <F extends URIS>(F: apply.Apply1<F>) =>
  <A, B>(a: Kind<F, A>, b: Kind<F, B>): Kind<F, [A, B]> =>
    apply.sequenceT(F)(a, b) as $IntentionalAny;

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export type Sequence3 = {
  /**
   * Tuple sequencing; executes three monadic computations and combines the results as a tuple.
   */
  <F extends URIS2>(F: apply.Apply2<F>): <E, A, B, C>(
    a: Kind2<F, E, A>,
    b: Kind2<F, E, B>,
    c: Kind2<F, E, C>,
  ) => Kind2<F, E, [A, B, C]>;
  /**
   * Tuple sequencing; executes three monadic computations and combines the results as a tuple.
   */
  <F extends URIS>(F: apply.Apply1<F>): <A, B, C>(
    a: Kind<F, A>,
    b: Kind<F, B>,
    c: Kind<F, C>,
  ) => Kind<F, [A, B, C]>;
};

export const sequence3: Sequence3 =
  <F extends URIS>(F: apply.Apply1<F>) =>
  <A, B, C>(a: Kind<F, A>, b: Kind<F, B>, c: Kind<F, C>): Kind<F, [A, B, C]> =>
    apply.sequenceT(F)(a, b, c) as $IntentionalAny;

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export type Sequence4 = {
  /**
   * Tuple sequencing; executes four monadic computations and combines the results as a tuple.
   */
  <F extends URIS2>(F: apply.Apply2<F>): <E, A, B, C, D>(
    a: Kind2<F, E, A>,
    b: Kind2<F, E, B>,
    c: Kind2<F, E, C>,
    d: Kind2<F, E, D>,
  ) => Kind2<F, E, [A, B, C, D]>;
  /**
   * Tuple sequencing; executes four monadic computations and combines the results as a tuple.
   */
  <F extends URIS>(F: apply.Apply1<F>): <A, B, C, D>(
    a: Kind<F, A>,
    b: Kind<F, B>,
    c: Kind<F, C>,
    d: Kind<F, D>,
  ) => Kind<F, [A, B, C, D]>;
};

export const sequence4: Sequence4 =
  <F extends URIS>(F: apply.Apply1<F>) =>
  <A, B, C, D>(a: Kind<F, A>, b: Kind<F, B>, c: Kind<F, C>, d: Kind<F, C>): Kind<F, [A, B, C, D]> =>
    apply.sequenceT(F)(a, b, c, d) as $IntentionalAny;

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export type Map2 = {
  /**
   * Executes two monadic computations and applies a function to the result.
   */
  <F extends URIS2>(F: apply.Apply2<F>): <E, A, B>(
    a: Kind2<F, E, A>,
    b: Kind2<F, E, B>,
  ) => <R>(f: FunctionN<[A, B], R>) => Kind2<F, E, R>;
  /**
   * Executes two monadic computations and applies a function to the result.
   */
  <F extends URIS>(F: apply.Apply1<F>): <A, B>(
    a: Kind<F, A>,
    b: Kind<F, B>,
  ) => <R>(f: FunctionN<[A, B], R>) => Kind<F, R>;
};

export const map2: Map2 =
  <F extends URIS>(F: apply.Apply1<F>) =>
  <A, B>(a: Kind<F, A>, b: Kind<F, B>) =>
  <R>(f: FunctionN<[A, B], R>): Kind<F, R> =>
    pipe(sequence2(F)(a, b), pipeable.pipeable(F).map(tupled(f)));

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

export type Map3 = {
  /**
   * Executes three monadic computations and applies a function to the result.
   */
  <F extends URIS2>(F: apply.Apply2<F>): <E, A, B, C>(
    a: Kind2<F, E, A>,
    b: Kind2<F, E, B>,
    c: Kind2<F, E, C>,
  ) => <R>(f: FunctionN<[A, B, C], R>) => Kind2<F, E, R>;
  /**
   * Executes three monadic computations and applies a function to the result.
   */
  <F extends URIS>(F: apply.Apply1<F>): <A, B, C>(
    a: Kind<F, A>,
    b: Kind<F, B>,
    c: Kind<F, C>,
  ) => <R>(f: FunctionN<[A, B, C], R>) => Kind<F, R>;
};

export const map3: Map3 =
  <F extends URIS>(F: apply.Apply1<F>) =>
  <A, B, C>(a: Kind<F, A>, b: Kind<F, B>, c: Kind<F, C>) =>
  <R>(f: FunctionN<[A, B, C], R>): Kind<F, R> =>
    pipe(sequence3(F)(a, b, c), pipeable.pipeable(F).map(tupled(f)));
