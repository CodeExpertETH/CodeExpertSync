/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2 } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { Applicative as Applicative1, Applicative2, Applicative2C } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import { Bifunctor2 } from 'fp-ts/Bifunctor';
import { Chain2 } from 'fp-ts/Chain';
import * as e from 'fp-ts/Either';
import * as eT from 'fp-ts/EitherT';
import { Eq } from 'fp-ts/Eq';
import { Extend2 } from 'fp-ts/Extend';
import { Foldable2 } from 'fp-ts/Foldable';
import { Functor2 } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { Monad2 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import * as o from 'fp-ts/Option';
import { Ord } from 'fp-ts/Ord';
import { sign } from 'fp-ts/Ordering';
import { Pointed2 } from 'fp-ts/Pointed';
import * as predicate from 'fp-ts/Predicate';
import { Predicate } from 'fp-ts/Predicate';
import * as refinement from 'fp-ts/Refinement';
import { Refinement } from 'fp-ts/Refinement';
import { Semigroup } from 'fp-ts/Semigroup';
import { Show } from 'fp-ts/Show';
import { Traversable2 } from 'fp-ts/Traversable';
import { Zero2 } from 'fp-ts/Zero';
import { LazyArg, constant, flow, identity, pipe } from 'fp-ts/function';
import * as remote from '../remote';

export const URI = 'RemoteEither';
export type URI = typeof URI;
declare module 'fp-ts/HKT' {
  export interface URItoKind2<E, A> {
    RemoteEither: RemoteEither<E, A>;
  }
}

export type Initial = remote.Initial;
export type Pending = remote.Pending;
export type Left<E> = remote.Done<e.Left<E>>;
export type Right<A> = remote.Done<e.Right<A>>;

export type RemoteEither<E, A> = remote.Remote<e.Either<E, A>>;

export const alt = eT.alt(remote.Monad);
export const altValidation = <E>(S: Semigroup<E>) => eT.altValidation(remote.Monad, S);
export const bimap = eT.bimap(remote.Functor);
export const flatMap = eT.chain(remote.Monad);
export const chain = flatMap;
export const chainNullableK = eT.chainNullableK(remote.Monad);
export const left = eT.left(remote.Pointed);
export const map = eT.map(remote.Functor);
export const mapLeft = eT.mapLeft(remote.Functor);
export const orElse = eT.orElse(remote.Monad);
export const right = eT.right(remote.Pointed);
export const fromRemote = eT.rightF(remote.Functor);

export const isInitial = remote.isInitial;
export const isPending = remote.isPending;
export const isLeft = remote.exists(e.isLeft);
export const isRight = remote.exists(e.isRight);

export const initial: RemoteEither<never, never> = remote.initial;
export const getInitial: <E, A>() => RemoteEither<E, A> = constant(initial);

export const pending: RemoteEither<never, never> = remote.pending;
export const getPending: <E, A>() => RemoteEither<E, A> = constant(pending);

export const of = right;
export const zero: <E, A>() => RemoteEither<E, A> = remote.zero;

export const ap: <E, A>(
  fa: RemoteEither<E, A>,
) => <B>(fab: RemoteEither<E, (a: A) => B>) => RemoteEither<E, B> =
  <E, A>(fa: RemoteEither<E, A>) =>
  <B>(fab: RemoteEither<E, (a: A) => B>) => {
    if (isInitial(fa)) {
      return isLeft(fab) ? fab : (initial as RemoteEither<any, any>);
    } else if (isPending(fa)) {
      return isPending(fab) ? pending : isRight(fab) ? fa : fab;
    } else {
      if (e.isLeft(fa.value)) {
        return isLeft(fab) ? fab : fa;
      } else {
        return isRight(fab) ? right(fab.value.right(fa.value.right)) : fab;
      }
    }
  };

export const getApplicativeValidation: <E>(SE: Semigroup<E>) => Applicative2C<URI, E> = (SE) => ({
  URI,
  _E: undefined as any,
  map: _map,
  of,
  ap: (fab, fa) => {
    if (isInitial(fa)) {
      return isLeft(fab) ? fab : (initial as RemoteEither<any, any>);
    } else if (isPending(fa)) {
      return isPending(fab) ? pending : isRight(fab) ? fa : fab;
    } else {
      if (e.isLeft(fa.value)) {
        return isLeft(fab) ? left(SE.concat(fab.value.left, fa.value.left)) : fa;
      } else {
        return isRight(fab) ? right(fab.value.right(fa.value.right)) : fab;
      }
    }
  },
});

export const chainW: <E2, A, B>(
  f: (a: A) => RemoteEither<E2, B>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> = chain<any, any, any>;

export const chainFirst: <A, E>(
  f: (a: A) => RemoteEither<E, unknown>,
) => (fa: RemoteEither<E, A>) => RemoteEither<E, A> = (f) => chain((a) => _map(f(a), () => a));

export const chainFirstW: <A, E2>(
  f: (a: A) => RemoteEither<E2, unknown>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, A> = (f) =>
  chainW((a) => _map(f(a), () => a));

export const chainEitherK: <E, A, B>(
  f: (a: A) => e.Either<E, B>,
) => (ma: RemoteEither<E, A>) => RemoteEither<E, B> = (f) => remote.map(e.chain(f));

export const chainEitherKW: <E2, A, B>(
  f: (a: A) => e.Either<E2, B>,
) => <E1>(ma: RemoteEither<E1, A>) => RemoteEither<E2 | E1, B> = (f) => remote.map(e.chainW(f));

export const chainOptionK: <E>(
  onNone: LazyArg<E>,
) => <A, B>(f: (a: A) => o.Option<B>) => (fa: RemoteEither<E, A>) => RemoteEither<E, B> =
  (onNone) => (f) =>
    remote.map(e.chainOptionK(onNone)(f));

export const chainOptionKW: <E2>(
  onNone: LazyArg<E2>,
) => <A, B>(
  f: (a: A) => o.Option<B>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> = (onNone) => (f) =>
  remote.map(e.chainOptionKW(onNone)(f));

export const chainRemoteK: <A, B>(
  f: (a: A) => remote.Remote<B>,
) => <E>(fa: RemoteEither<E, A>) => RemoteEither<E, B> = <A, B>(f: (a: A) => remote.Remote<B>) =>
  chain(flow(f, remote.map(e.right<any, B>)));

export const match: <E, A, B>(
  onInitial: () => B,
  onPending: () => B,
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
) => (fa: RemoteEither<E, A>) => B = (i, p, l, r) => remote.fold(i, p, e.fold(l, r));

export const getOrElseW: <E, B>(onNone: LazyArg<B>) => <A>(fa: RemoteEither<E, A>) => A | B =
  (onNone) => (fa) =>
    isRight(fa) ? fa.value.right : onNone();

export const getOrElse =
  <E, A>(onNone: LazyArg<A>) =>
  <A>(fa: RemoteEither<E, A>) =>
    getOrElseW(onNone)(fa);

export const fold3 = <E, A, R>(onNone: LazyArg<R>, onLeft: (e: E) => R, onRight: (a: A) => R) =>
  match(onNone, onNone, onLeft, onRight);

export const fromNullable =
  <E>(onNull: LazyArg<E>) =>
  <A>(a: A): RemoteEither<E, NonNullable<A>> =>
    a != null ? right(a) : left(onNull());

export const fromNullableK =
  <E>(onNull: LazyArg<E>) =>
  <Args extends Array<unknown>, A>(
    f: (...a: Args) => A,
  ): ((...a: Args) => RemoteEither<E, NonNullable<A>>) =>
    flow(f, fromNullable(onNull));

export const toNullable = <E, A>(ma: RemoteEither<E, A>): A | null =>
  isRight(ma) ? ma.value.right : null;

export const toUndefined = <E, A>(ma: RemoteEither<E, A>): A | undefined =>
  isRight(ma) ? ma.value.right : undefined;

export const fromOption =
  <E>(onNone: LazyArg<E>) =>
  <A>(oa: o.Option<A>): RemoteEither<E, A> => {
    if (o.isNone(oa)) {
      return left(onNone());
    } else {
      return right(oa.value);
    }
  };

export const toOption: <E, A>(fa: RemoteEither<E, A>) => o.Option<A> = (fa) =>
  isRight(fa) ? o.some(fa.value.right) : o.none;

export const fromEither = <E, A>(ea: e.Either<E, A>): RemoteEither<E, A> =>
  e.fold<E, A, RemoteEither<E, A>>(left, right)(ea);

export const toEither =
  <E>(onInitial: () => E, onPending: () => E) =>
  <A>(fa: RemoteEither<E, A>): e.Either<E, A> =>
    remote.fold<e.Either<E, A>, e.Either<E, A>>(
      flow(onInitial, e.left),
      flow(onPending, e.left),
      identity,
    )(fa);

export const elem: <A>(E: Eq<A>) => (a: A) => <E>(fa: RemoteEither<E, A>) => boolean =
  (E) => (a) => (fa) =>
    isRight(fa) && E.equals(fa.value.right, a);

export const exists: <A>(predicate: Predicate<A>) => (fa: RemoteEither<unknown, A>) => boolean =
  (predicate) => (fa) =>
    isRight(fa) && predicate(fa.value.right);

export const fromPredicate: {
  <A, B extends A, E>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A,
  ) => RemoteEither<E, B>;
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E): <B extends A>(b: B) => RemoteEither<E, B>;
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => RemoteEither<E, A>;
} =
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E) =>
  (a: A) =>
    predicate(a) ? right(a) : left(onFalse(a));

export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteEither<E, A>) => B =
  (b, f) => (fa) =>
    isRight(fa) ? f(b, fa.value.right) : b;

export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteEither<E, A>) => B =
  (b, f) => (fa) =>
    isRight(fa) ? f(fa.value.right, b) : b;

export const foldMap: <M>(
  M: Monoid<M>,
) => <A>(f: (a: A) => M) => <E>(fa: RemoteEither<E, A>) => M = (M) => (f) => (fa) =>
  isRight(fa) ? f(fa.value.right) : M.empty;

export const traverse: <F>(
  F: Applicative1<F>,
) => <A, B>(fab: (a: A) => HKT<F, B>) => <E>(f: RemoteEither<E, A>) => HKT<F, RemoteEither<E, B>> =
  (F) => (fab) => (f) =>
    isRight(f) ? F.map(fab(f.value.right), right) : F.of(f as any);

export const sequence: <F>(
  F: Applicative1<F>,
) => <E, A>(f: RemoteEither<E, HKT<F, A>>) => HKT<F, RemoteEither<E, A>> = (F) =>
  traverse(F)(identity);

export const extend: <E, A, B>(
  f: (fa: RemoteEither<E, A>) => B,
) => (fa: RemoteEither<E, A>) => RemoteEither<E, B> = (f) => (fa) =>
  isRight(fa) ? right(f(fa)) : (fa as any);

export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    ma: RemoteEither<E, A>,
  ) => RemoteEither<E, B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (
    ma: RemoteEither<E, A>,
  ) => RemoteEither<E, A>;
} =
  <E, A, B extends A>(
    pred: refinement.Refinement<A, B> | predicate.Predicate<A>,
    onFalse: (a: A) => E,
  ) =>
  (rd: RemoteEither<E, A>) =>
    isRight(rd) ? (pred(rd.value.right) ? rd : left(onFalse(rd.value.right))) : rd;

export const _match = <E, A, B>(
  fa: RemoteEither<E, A>,
  onInitial: () => B,
  onPending: () => B,
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
) => match(onInitial, onPending, onLeft, onRight)(fa);

const _ap: apply.Apply2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _map: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _chain: Chain2<URI>['chain'] = (fa, f) => pipe(fa, chain(f));
const _alt: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));
const _traverse =
  <F>(F: Applicative1<F>) =>
  <E, A, B>(f: RemoteEither<E, A>, fab: (a: A) => HKT<F, B>) =>
    pipe(f, traverse(F)(fab));
const _reduce: Traversable2<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f));
const _reduceRight: Traversable2<URI>['reduceRight'] = (fa, b, f) => pipe(fa, reduceRight(b, f));
const _foldMap =
  <M>(M: Monoid<M>) =>
  <E, A>(fa: RemoteEither<E, A>, f: (a: A) => M) =>
    pipe(fa, foldMap(M)(f));
const _bimap: Bifunctor2<URI>['bimap'] = (fea, f, g) => pipe(fea, bimap(f, g));
const _mapLeft: Bifunctor2<URI>['mapLeft'] = (fea, f) => pipe(fea, mapLeft(f));
const _extend: Extend2<URI>['extend'] = (wa, f) => pipe(wa, extend(f));

export const Alt: Alt2<URI> = {
  URI,
  map: _map,
  alt: _alt,
};

export const Alternative: Alternative2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  alt: _alt,
  of,
  zero,
};

export const Applicative: Applicative2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
};

export const Apply: apply.Apply2<URI> = {
  URI,
  map: _map,
  ap: _ap,
};

export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: _bimap,
  mapLeft: _mapLeft,
};

export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

export const Extend: Extend2<URI> = {
  URI,
  map: _map,
  extend: _extend,
};

export const Foldable: Foldable2<URI> = {
  URI,
  reduce: _reduce,
  reduceRight: _reduceRight,
  foldMap: _foldMap,
};

export const Functor: Functor2<URI> = {
  URI,
  map: _map,
};

export const Monad: Monad2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};

export const Pointed: Pointed2<URI> = {
  URI,
  of,
};

export const Traversable: Traversable2<URI> = {
  URI,
  map: _map,
  traverse: _traverse,
  sequence,
  reduce: _reduce,
  reduceRight: _reduceRight,
  foldMap: _foldMap,
};

export const Zero: Zero2<URI> = {
  URI,
  zero,
};

export const getEq = <E, A>(EE: Eq<E>, EA: Eq<A>): Eq<RemoteEither<E, A>> => ({
  equals: (x, y) =>
    _match(
      x,
      () => isInitial(y),
      () => isPending(y),
      (ex) => isLeft(y) && EE.equals(ex, y.value.left),
      (ax) => isRight(y) && EA.equals(ax, y.value.right),
    ),
});

export const getMonoid = <E, A>(SA: Semigroup<A>): Monoid<RemoteEither<E, A>> =>
  remote.getMonoid(e.getSemigroup(SA));

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
export const getOrd = <E, A>(OE: Ord<E>, OA: Ord<A>): Ord<RemoteEither<E, A>> => ({
  ...getEq(OE, OA),
  compare: (x, y) =>
    sign(
      _match(
        x,
        () => _match(y, constEq, constLt, constLt, constLt),
        () => _match(y, constGt, constEq, constLt, constLt),
        (xLeft) => _match(y, constGt, constGt, (yLeft) => OE.compare(xLeft, yLeft), constLt),
        (xRight) => _match(y, constGt, constGt, constGt, (yRight) => OA.compare(xRight, yRight)),
      ),
    ),
});

export const getShow = <E, A>(SE: Show<E>, SA: Show<A>): Show<RemoteEither<E, A>> => ({
  show: match(
    () => 'initial',
    () => 'pending',
    (e) => `left(${SE.show(e)})`,
    (a) => `right(${SA.show(a)})`,
  ),
});

export const sequenceS = apply.sequenceS(Apply);

export const sequenceT = apply.sequenceT(Apply);

/**
 * The order of parameters `next` and `current` comes from the fact that this is a similar operation
 * to `alt`. Additionally, doing it like this gives us an elegant way of building Dispatches/Reducers,
 * which is a pattern that sees a lot of use in React.
 */
export type RefreshStrategy = <E, A>(
  next: RemoteEither<E, A>,
) => (current: RemoteEither<E, A>) => RemoteEither<E, A>;

export const staleWhileRevalidate: RefreshStrategy = (next) => (current) =>
  pipe(
    next,
    match(
      () => current,
      () => (isInitial(current) ? next : current),
      () => next,
      () => next,
    ),
  );

export const staleIfError: RefreshStrategy = (next) => (current) =>
  pipe(
    next,
    match(
      () => current,
      () => (isInitial(current) || isLeft(current) ? next : current),
      () => (isRight(current) ? current : next),
      () => next,
    ),
  );
