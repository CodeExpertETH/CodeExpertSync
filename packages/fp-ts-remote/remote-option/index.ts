/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2 } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { Applicative as Applicative1, Applicative2, Applicative2C } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import { Bifunctor2 } from 'fp-ts/Bifunctor';
import { Chain2 } from 'fp-ts/Chain';
import * as o from 'fp-ts/Option';
import * as oT from 'fp-ts/OptionT';
import { Eq } from 'fp-ts/Eq';
import { Extend2 } from 'fp-ts/Extend';
import { Foldable2 } from 'fp-ts/Foldable';
import { Functor2 } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { Monad2 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
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

export const URI = 'RemoteOption';
export type URI = typeof URI;
declare module 'fp-ts/HKT' {
  export interface URItoKind2<E, A> {
    RemoteOption: RemoteOption<A>;
  }
}

export type Initial = remote.Initial;
export type Pending = remote.Pending;
export type None = remote.Done<o.None>;
export type Some<A> = remote.Done<o.Some<A>>;

export type RemoteOption<A> = remote.Remote<o.Option<A>>;

export const alt = oT.alt(remote.Monad);
export const flatMap = oT.chain(remote.Monad);
export const chain = flatMap;
export const chainNullableK = oT.chainNullableK(remote.Monad);
export const map = oT.map(remote.Functor);
export const orElse = oT.orElse(remote.Monad);
export const some = oT.some(remote.Pointed);
export const fromRemote = oT.someF(remote.Functor);

export const isSome = remote.exists(o.isSome);

export const none = remote.done(o.none);
export const isNone = remote.exists(o.isNone);

export const initial: RemoteOption<never> = remote.initial;
export const getInitial: <E, A>() => RemoteOption<A> = constant(initial);
export const isInitial = remote.isInitial;

export const pending: RemoteOption<never> = remote.pending;
export const getPending: <E, A>() => RemoteOption<A> = constant(pending);
export const isPending = remote.isPending;

export const of = some;
export const zero: <A>() => RemoteOption<A> = remote.zero;

export const ap: <A>(
  fa: RemoteOption<A>,
) => <B>(fab: RemoteOption<(a: A) => B>) => RemoteOption<B> =
  <A>(fa: RemoteOption<A>) =>
    <B>(fab: RemoteOption<(a: A) => B>) => {
      if (isInitial(fa)) {
        return isNone(fab) ? fab : (initial as RemoteOption<any>);
      } else if (isPending(fa)) {
        return isPending(fab) ? pending : isSome(fab) ? fa : fab;
      } else {
        if (o.isNone(fa.value)) {
          return isNone(fab) ? fab : fa;
        } else {
          return isSome(fab) ? some(fab.value.some(fa.value.some)) : fab;
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
      return isNone(fab) ? fab : (initial as RemoteOption<any>);
    } else if (isPending(fa)) {
      return isPending(fab) ? pending : isSome(fab) ? fa : fab;
    } else {
      if (o.isNone(fa.value)) {
        return isNone(fab) ? none(SE.concat(fab.value.none, fa.value.none)) : fa;
      } else {
        return isSome(fab) ? some(fab.value.some(fa.value.some)) : fab;
      }
    }
  },
});

export const chainW: <E2, A, B>(
  f: (a: A) => RemoteOption<B>,
) => <E1>(fa: RemoteOption<A>) => RemoteOption<B> = chain<any, any, any>;

export const chainFirst: <A, E>(
  f: (a: A) => RemoteOption<unknown>,
) => (fa: RemoteOption<A>) => RemoteOption<A> = (f) => chain((a) => _map(f(a), () => a));

export const chainFirstW: <A, E2>(
  f: (a: A) => RemoteOption<unknown>,
) => <E1>(fa: RemoteOption<A>) => RemoteOption<A> = (f) =>
  chainW((a) => _map(f(a), () => a));

export const chainOptionK: <E, A, B>(
  f: (a: A) => o.Option<E, B>,
) => (ma: RemoteOption<A>) => RemoteOption<B> = (f) => remote.map(o.chain(f));

export const chainOptionKW: <E2, A, B>(
  f: (a: A) => o.Option<E2, B>,
) => <E1>(ma: RemoteOption<A>) => RemoteOption<B> = (f) => remote.map(o.chainW(f));

export const chainOptionK: <E>(
  onNone: LazyArg<E>,
) => <A, B>(f: (a: A) => o.Option<B>) => (fa: RemoteOption<A>) => RemoteOption<B> =
  (onNone) => (f) =>
    remote.map(o.chainOptionK(onNone)(f));

export const chainOptionKW: <E2>(
  onNone: LazyArg<E2>,
) => <A, B>(
  f: (a: A) => o.Option<B>,
) => <E1>(fa: RemoteOption<A>) => RemoteOption<B> = (onNone) => (f) =>
  remote.map(o.chainOptionKW(onNone)(f));

export const chainRemoteK: <A, B>(
  f: (a: A) => remote.Remote<B>,
) => <E>(fa: RemoteOption<A>) => RemoteOption<B> = <A, B>(f: (a: A) => remote.Remote<B>) =>
  chain(flow(f, remote.map(o.some<any, B>)));

export const match: <E, A, B>(
  onInitial: () => B,
  onPending: () => B,
  onNone: (e: E) => B,
  onSome: (a: A) => B,
) => (fa: RemoteOption<A>) => B = (i, p, l, r) => remote.fold(i, p, o.fold(l, r));

export const getOrElseW: <E, B>(onNone: LazyArg<B>) => <A>(fa: RemoteOption<A>) => A | B =
  (onNone) => (fa) =>
    isSome(fa) ? fa.value.some : onNone();

export const getOrElse =
  <E, A>(onNone: LazyArg<A>) =>
    <A>(fa: RemoteOption<A>) =>
      getOrElseW(onNone)(fa);

export const fold3 = <E, A, R>(onNone: LazyArg<R>, onNone: (e: E) => R, onSome: (a: A) => R) =>
  match(onNone, onNone, onNone, onSome);

export const fromNullable =
  <E>(onNull: LazyArg<E>) =>
    <A>(a: A): RemoteOption<NonNullable<A>> =>
      a != null ? some(a) : none(onNull());

export const fromNullableK =
  <E>(onNull: LazyArg<E>) =>
    <Args extends Array<unknown>, A>(
      f: (...a: Args) => A,
    ): ((...a: Args) => RemoteOption<NonNullable<A>>) =>
      flow(f, fromNullable(onNull));

export const toNullable = <E, A>(ma: RemoteOption<A>): A | null =>
  isSome(ma) ? ma.value.some : null;

export const toUndefined = <E, A>(ma: RemoteOption<A>): A | undefined =>
  isSome(ma) ? ma.value.some : undefined;

export const fromOption =
  <E>(onNone: LazyArg<E>) =>
    <A>(oa: o.Option<A>): RemoteOption<A> => {
      if (o.isNone(oa)) {
        return none(onNone());
      } else {
        return some(oa.value);
      }
    };

export const toOption: <E, A>(fa: RemoteOption<A>) => o.Option<A> = (fa) =>
  isSome(fa) ? o.some(fa.value.some) : o.none;

export const fromOption = <E, A>(ea: o.Option<E, A>): RemoteOption<A> =>
  o.fold<E, A, RemoteOption<A>>(none, some)(ea);

export const toOption =
  <E>(onInitial: () => E, onPending: () => E) =>
    <A>(fa: RemoteOption<A>): o.Option<E, A> =>
      remote.fold<o.Option<E, A>, o.Option<E, A>>(
        flow(onInitial, o.none),
        flow(onPending, o.none),
        identity,
      )(fa);

export const elem: <A>(E: Eq<A>) => (a: A) => <E>(fa: RemoteOption<A>) => boolean =
  (E) => (a) => (fa) =>
    isSome(fa) && E.equals(fa.value.some, a);

export const exists: <A>(predicate: Predicate<A>) => (fa: RemoteOption<A>) => boolean =
  (predicate) => (fa) =>
    isSome(fa) && predicate(fa.value.some);

export const fromPredicate: {
  <A, B extends A, E>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    a: A,
  ) => RemoteOption<B>;
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E): <B extends A>(b: B) => RemoteOption<B>;
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E): (a: A) => RemoteOption<A>;
} =
  <A, E>(predicate: Predicate<A>, onFalse: (a: A) => E) =>
    (a: A) =>
      predicate(a) ? some(a) : none(onFalse(a));

export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteOption<A>) => B =
  (b, f) => (fa) =>
    isSome(fa) ? f(b, fa.value.some) : b;

export const reduceSome: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteOption<A>) => B =
  (b, f) => (fa) =>
    isSome(fa) ? f(fa.value.some, b) : b;

export const foldMap: <M>(
  M: Monoid<M>,
) => <A>(f: (a: A) => M) => <E>(fa: RemoteOption<A>) => M = (M) => (f) => (fa) =>
  isSome(fa) ? f(fa.value.some) : M.empty;

export const traverse: <F>(
  F: Applicative1<F>,
) => <A, B>(fab: (a: A) => HKT<F, B>) => <E>(f: RemoteOption<A>) => HKT<F, RemoteOption<B>> =
  (F) => (fab) => (f) =>
    isSome(f) ? F.map(fab(f.value.some), some) : F.of(f as any);

export const sequence: <F>(
  F: Applicative1<F>,
) => <E, A>(f: RemoteOption<HKT<F, A>>) => HKT<F, RemoteOption<A>> = (F) =>
  traverse(F)(identity);

export const extend: <E, A, B>(
  f: (fa: RemoteOption<A>) => B,
) => (fa: RemoteOption<A>) => RemoteOption<B> = (f) => (fa) =>
  isSome(fa) ? some(f(fa)) : (fa as any);

export const filterOrElse: {
  <E, A, B extends A>(refinement: Refinement<A, B>, onFalse: (a: A) => E): (
    ma: RemoteOption<A>,
  ) => RemoteOption<B>;
  <E, A>(predicate: Predicate<A>, onFalse: (a: A) => E): (
    ma: RemoteOption<A>,
  ) => RemoteOption<A>;
} =
  <E, A, B extends A>(
    pred: refinement.Refinement<A, B> | predicate.Predicate<A>,
    onFalse: (a: A) => E,
  ) =>
    (rd: RemoteOption<A>) =>
      isSome(rd) ? (pred(rd.value.some) ? rd : none(onFalse(rd.value.some))) : rd;

export const _match = <E, A, B>(
  fa: RemoteOption<A>,
  onInitial: () => B,
  onPending: () => B,
  onNone: (e: E) => B,
  onSome: (a: A) => B,
) => match(onInitial, onPending, onNone, onSome)(fa);

const _ap: apply.Apply2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _map: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _chain: Chain2<URI>['chain'] = (fa, f) => pipe(fa, chain(f));
const _alt: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));
const _traverse =
  <F>(F: Applicative1<F>) =>
    <E, A, B>(f: RemoteOption<A>, fab: (a: A) => HKT<F, B>) =>
      pipe(f, traverse(F)(fab));
const _reduce: Traversable2<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f));
const _reduceSome: Traversable2<URI>['reduceSome'] = (fa, b, f) => pipe(fa, reduceSome(b, f));
const _foldMap =
  <M>(M: Monoid<M>) =>
    <E, A>(fa: RemoteOption<A>, f: (a: A) => M) =>
      pipe(fa, foldMap(M)(f));
const _bimap: Bifunctor2<URI>['bimap'] = (fea, f, g) => pipe(fea, bimap(f, g));
const _mapNone: Bifunctor2<URI>['mapNone'] = (fea, f) => pipe(fea, mapNone(f));
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
  mapNone: _mapNone,
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
  reduceSome: _reduceSome,
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
  reduceSome: _reduceSome,
  foldMap: _foldMap,
};

export const Zero: Zero2<URI> = {
  URI,
  zero,
};

export const getEq = <E, A>(EE: Eq<E>, EA: Eq<A>): Eq<RemoteOption<A>> => ({
  equals: (x, y) =>
    _match(
      x,
      () => isInitial(y),
      () => isPending(y),
      (ex) => isNone(y) && EE.equals(ex, y.value.none),
      (ax) => isSome(y) && EA.equals(ax, y.value.some),
    ),
});

export const getMonoid = <E, A>(SA: Semigroup<A>): Monoid<RemoteOption<A>> =>
  remote.getMonoid(o.getSemigroup(SA));

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
export const getOrd = <E, A>(OE: Ord<E>, OA: Ord<A>): Ord<RemoteOption<A>> => ({
  ...getEq(OE, OA),
  compare: (x, y) =>
    sign(
      _match(
        x,
        () => _match(y, constEq, constLt, constLt, constLt),
        () => _match(y, constGt, constEq, constLt, constLt),
        (xNone) => _match(y, constGt, constGt, (yNone) => OE.compare(xNone, yNone), constLt),
        (xSome) => _match(y, constGt, constGt, constGt, (ySome) => OA.compare(xSome, ySome)),
      ),
    ),
});

export const getShow = <E, A>(SE: Show<E>, SA: Show<A>): Show<RemoteOption<A>> => ({
  show: match(
    () => 'initial',
    () => 'pending',
    (e) => `none(${SE.show(e)})`,
    (a) => `some(${SA.show(a)})`,
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
  next: RemoteOption<A>,
) => (current: RemoteOption<A>) => RemoteOption<A>;

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
      () => (isInitial(current) || isNone(current) ? next : current),
      () => (isSome(current) ? current : next),
      () => next,
    ),
  );
