/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt1 } from 'fp-ts/Alt';
import { Alternative1 } from 'fp-ts/Alternative';
import { Applicative1, Applicative as ApplicativeHKT } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import * as chainable from 'fp-ts/Chain';
import * as e from 'fp-ts/Either';
import { Eq } from 'fp-ts/Eq';
import { Extend1 } from 'fp-ts/Extend';
import { Foldable1 } from 'fp-ts/Foldable';
import * as fe from 'fp-ts/FromEither';
import { Functor1 } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { Monad1 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import * as o from 'fp-ts/Option';
import * as oT from 'fp-ts/OptionT';
import { Ord } from 'fp-ts/Ord';
import { sign } from 'fp-ts/Ordering';
import { Pointed1 } from 'fp-ts/Pointed';
import * as predicate from 'fp-ts/Predicate';
import { Predicate } from 'fp-ts/Predicate';
import * as refinement from 'fp-ts/Refinement';
import { Refinement } from 'fp-ts/Refinement';
import { Semigroup } from 'fp-ts/Semigroup';
import { Show } from 'fp-ts/Show';
import { Traversable1 } from 'fp-ts/Traversable';
import { Zero1 } from 'fp-ts/Zero';
import { LazyArg, constant, flow, identity, pipe } from 'fp-ts/function';
import * as remote from '../remote';

/**
 * @category Instances
 */
export const URI = 'RemoteOption';

/**
 * @category Instances
 */
export type URI = typeof URI;

declare module 'fp-ts/HKT' {
  export interface URItoKind<A> {
    RemoteOption: RemoteOption<A>;
  }
}

/**
 * @category Model
 */
export type Initial = remote.Initial;

/**
 * @category Model
 */
export type Pending = remote.Pending;

/**
 * @category Model
 */
export type None = remote.Done<o.None>;

/**
 * @category Model
 */
export type Some<A> = remote.Done<o.Some<A>>;

/**
 * @category Model
 */
export type RemoteOption<A> = remote.Remote<o.Option<A>>;

/**
 * @category Constructors
 */
export const initial: RemoteOption<never> = remote.initial;

/**
 * @category Constructors
 */
export const constInitial: <A>() => RemoteOption<A> = constant(initial);

/**
 * @category Constructors
 */
export const pending: RemoteOption<never> = remote.pending;

/**
 * @category Constructors
 */
export const constPending: <A>() => RemoteOption<A> = constant(pending);

/**
 * @category Constructors
 */
export const none = remote.done(o.none);

/**
 * @category Constructors
 */
export const constNone: <A>() => RemoteOption<A> = constant(none);

/**
 * @category Constructors
 */
export const some = oT.some(remote.Pointed);

/**
 * @category Constructors
 */
export const of = some;

/**
 * @category Instances
 */
export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

/**
 * @category Constructors
 */
export const zero: <A>() => RemoteOption<A> = remote.zero;

/**
 * @category Instances
 */
export const Zero: Zero1<URI> = {
  URI,
  zero,
};

/**
 * @category Refinements
 */
export const isInitial = remote.isInitial;

/**
 * @category Refinements
 */
export const isPending = remote.isPending;

/**
 * @category Refinements
 */
export const isNone = remote.exists(o.isNone);

/**
 * @category Refinements
 */
export const isSome = remote.exists(o.isSome);

/**
 * @category Destructors
 */
export const match: <A, B>(
  onInitial: () => B,
  onPending: () => B,
  onNone: () => B,
  onSome: (a: A) => B,
) => (fa: RemoteOption<A>) => B = (i, p, l, r) => remote.fold(i, p, o.fold(l, r));

/**
 * Use {@link match}
 *
 * @deprecated
 * @category legacy
 */
export const fold = match;

/**
 * @internal
 */
const _match = <A, B>(
  fa: RemoteOption<A>,
  onInitial: () => B,
  onPending: () => B,
  onNone: () => B,
  onSome: (a: A) => B,
) => match(onInitial, onPending, onNone, onSome)(fa);

/**
 * @category mapping
 */
export const map = oT.map(remote.Functor);

/**
 * @category Instances
 */
export const Functor: Functor1<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f)),
};

/**
 * @category utils
 */
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
        return isSome(fab) ? some(fab.value.value(fa.value.value)) : fab;
      }
    }
  };

/**
 * @category Instances
 */
export const Apply: apply.Apply1<URI> = {
  ...Functor,
  ap: (fab, fa) => pipe(fab, ap(fa)),
};

/**
 * @category Instances
 */
export const Applicative: Applicative1<URI> = {
  ...Apply,
  ...Pointed,
};

/**
 * @category sequencing
 */
export const flatMap = oT.chain(remote.Monad);

/**
 * Use {@link flatMap}
 *
 * @deprecated
 * @category legacy
 */
export const chain = flatMap;

/**
 * @category Instances
 */
export const Chain: chainable.Chain1<URI> = {
  ...Apply,
  chain: (fa, f) => pipe(fa, flatMap(f)),
};

/**
 * @category Instances
 */
export const Monad: Monad1<URI> = {
  ...Chain,
  ...Applicative,
};

/**
 * @category folding
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: RemoteOption<A>) => B =
  (b, f) => (fa) =>
    isSome(fa) ? f(b, fa.value.value) : b;

/**
 * @category folding
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: RemoteOption<A>) => B =
  (b, f) => (fa) =>
    isSome(fa) ? f(fa.value.value, b) : b;

/**
 * @category folding
 */
export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: RemoteOption<A>) => M =
  (M) => (f) => (fa) =>
    isSome(fa) ? f(fa.value.value) : M.empty;

/**
 * @category Instances
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce: (fa, b, f) => pipe(fa, reduce(b, f)),
  reduceRight: (fa, b, f) => pipe(fa, reduceRight(b, f)),
  foldMap:
    <M>(M: Monoid<M>) =>
    <A>(fa: RemoteOption<A>, f: (a: A) => M) =>
      pipe(fa, foldMap(M)(f)),
};

/**
 * @category traversing
 */
export const traverse: <F>(
  F: ApplicativeHKT<F>,
) => <A, B>(fab: (a: A) => HKT<F, B>) => (f: RemoteOption<A>) => HKT<F, RemoteOption<B>> =
  (F) => (fab) => (f) =>
    isSome(f) ? F.map(fab(f.value.value), some) : F.of(f as any);

/**
 * @category traversing
 */
export const sequence: <F>(
  F: ApplicativeHKT<F>,
) => <A>(f: RemoteOption<HKT<F, A>>) => HKT<F, RemoteOption<A>> = (F) => traverse(F)(identity);

/**
 * @category Instances
 */
export const Traversable: Traversable1<URI> = {
  ...Functor,
  ...Foldable,
  sequence,
  traverse:
    <F>(F: ApplicativeHKT<F>) =>
    <A, B>(f: RemoteOption<A>, fab: (a: A) => HKT<F, B>) =>
      pipe(f, traverse(F)(fab)),
};

/**
 * @category error handling
 */
export const alt = oT.alt(remote.Monad);

/**
 * @category Instances
 */
export const Alt: Alt1<URI> = {
  ...Functor,
  alt: (fa, that) => pipe(fa, alt(that)),
};

/**
 * @category Instances
 */
export const Alternative: Alternative1<URI> = {
  ...Applicative,
  ...Alt,
  ...Zero,
};

/**
 * @category utils
 */
export const extend: <A, B>(
  f: (fa: RemoteOption<A>) => B,
) => (fa: RemoteOption<A>) => RemoteOption<B> = (f) => (fa) =>
  isSome(fa) ? some(f(fa)) : (fa as any);

/**
 * @category Instances
 */
export const Extend: Extend1<URI> = {
  ...Functor,
  extend: (wa, f) => pipe(wa, extend(f)),
};

/**
 * @category conversions
 */
export const fromEither = <A>(ea: e.Either<unknown, A>): RemoteOption<A> =>
  e.fold<unknown, A, RemoteOption<A>>(constNone, some)(ea);

/**
 * @category Instances
 */
export const FromEither: fe.FromEither1<URI> = {
  URI,
  fromEither,
};

/**
 * @category utils
 */
export const apFirst = apply.apFirst(Apply);

/**
 * @category utils
 */
export const apSecond = apply.apSecond(Apply);

/**
 * @category do notation
 */
export const apS = apply.apS(Apply);

/**
 * @category do notation
 */
export const bind = chainable.bind(Chain);

/**
 * @category filtering
 */
export const filterOrElse: {
  <A, B extends A>(refinement: Refinement<A, B>): (ma: RemoteOption<A>) => RemoteOption<B>;
  <A>(predicate: Predicate<A>): (ma: RemoteOption<A>) => RemoteOption<A>;
} =
  <A, B extends A>(pred: refinement.Refinement<A, B> | predicate.Predicate<A>) =>
  (rd: RemoteOption<A>) =>
    isSome(rd) ? (pred(rd.value.value) ? rd : none) : rd;

/**
 * @category conversions
 */
export const fromOption: <A>(oa: o.Option<A>) => RemoteOption<A> = remote.of;

/**
 * @category conversions
 */
export const fromNullable = oT.fromNullable(remote.Pointed);

/**
 * @category conversions
 */
export const fromPredicate = oT.fromPredicate(remote.Pointed);

/**
 * @category conversions
 */
export const fromRemote = oT.fromF(remote.Functor);

/**
 * @category lifting
 */
export const liftEither = fe.fromEitherK(FromEither);

/**
 * @category lifting
 */
export const liftOption = oT.fromOptionK(remote.Pointed);

/**
 * @category lifting
 */
export const liftNullable = oT.fromNullableK(remote.Pointed);

/**
 * @category lifting
 */
export const liftRemote = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => remote.Remote<B>,
): ((...a: A) => RemoteOption<B>) => flow(f, fromRemote);

/**
 * @category sequencing
 */
export const flatten: <A>(ffa: RemoteOption<RemoteOption<A>>) => RemoteOption<A> =
  flatMap(identity);

/**
 * @category sequencing
 */
export const flatMapOption = oT.chainOptionK(remote.Monad);

/**
 * Use {@link flatMapOption}
 *
 * @deprecated
 * @category legacy
 */
export const chainOptionK = flatMapOption;

/**
 * @category sequencing
 */
export const flatMapNullable = oT.chainNullableK(remote.Monad);

/**
 * Use {@link flatMapNullable}
 *
 * @deprecated
 * @category legacy
 */
export const chainNullableK = flatMapNullable;

/**
 * @category sequencing
 */
export const flatMapEither = fe.chainEitherK(FromEither, Chain);

/**
 * Use {@link flatMapEither}
 *
 * @deprecated
 * @category legacy
 */
export const chainEitherK = flatMapEither;

/**
 * @category sequencing
 */
export const flatMapRemote: <A, B>(
  f: (a: A) => remote.Remote<B>,
) => (fa: RemoteOption<A>) => RemoteOption<B> = flow(liftRemote, flatMap);

/**
 * Use {@link flatMapRemote}
 *
 * @deprecated
 * @category legacy
 */
export const chainRemoteK = flatMapRemote;

/**
 * @category sequencing
 */
export const tap = chainable.chainFirst(Chain);

/**
 * Use {@link tap}
 *
 * @deprecated
 * @category legacy
 */
export const chainFirst = tap;

/**
 * @category sequencing
 */
export const tapEither = fe.chainFirstEitherK(FromEither, Chain);

/**
 * Use {@link tapEither}
 *
 * @deprecated
 * @category legacy
 */
export const chainFirstEitherK = tapEither;

/**
 * @category sequencing
 */
export const tapOption: <A>(
  f: (a: A) => o.Option<unknown>,
) => (fa: RemoteOption<A>) => RemoteOption<A> = flow(liftOption, tap);

/**
 * Use {@link tapOption}
 *
 * @deprecated
 * @category legacy
 */
export const chainFirstOptionK = tapOption;

/**
 * @category sequencing
 */
export const tapRemote: <A>(
  f: (a: A) => remote.Remote<unknown>,
) => (fa: RemoteOption<A>) => RemoteOption<A> = flow(liftRemote, tap);

/**
 * Use {@link tapRemote}
 *
 * @deprecated
 * @category legacy
 */
export const chainFirstRemoteK = tapRemote;

/**
 * @category Destructors
 */
export const getOrElseW: <B>(onNone: LazyArg<B>) => <A>(fa: RemoteOption<A>) => A | B =
  (onNone) => (fa) =>
    isSome(fa) ? fa.value.value : onNone();

/**
 * @category Destructors
 */
export const getOrElse =
  <A>(onNone: LazyArg<A>) =>
  <A>(fa: RemoteOption<A>) =>
    getOrElseW(onNone)(fa);

/**
 * @category Destructors
 */
export const match3 = <A, R>(onUnresolved: LazyArg<R>, onNone: () => R, onSome: (a: A) => R) =>
  match(onUnresolved, onUnresolved, onNone, onSome);

/**
 * @category Destructors
 */
export const toNullable = <A>(ma: RemoteOption<A>): A | null =>
  isSome(ma) ? ma.value.value : null;

/**
 * @category Destructors
 */
export const toUndefined = <A>(ma: RemoteOption<A>): A | undefined =>
  isSome(ma) ? ma.value.value : undefined;

/**
 * @category Destructors
 */
export const toOption: <A>(fa: RemoteOption<A>) => o.Option<A> = remote.fold(
  constant(o.none),
  constant(o.none),
  identity,
);

/**
 * @category Destructors
 */
export const toEither = <E>(
  onInitial: () => E,
  onPending: () => E,
  onNone: () => E,
): (<A>(fa: RemoteOption<A>) => e.Either<E, A>) =>
  remote.fold(flow(onInitial, e.left), flow(onPending, e.left), e.fromOption(onNone));

/**
 * @category utils
 */
export const elem: <A>(E: Eq<A>) => (a: A) => (fa: RemoteOption<A>) => boolean =
  (E) => (a) => (fa) =>
    isSome(fa) && E.equals(fa.value.value, a);

/**
 * @category utils
 */
export const exists: <A>(predicate: Predicate<A>) => (fa: RemoteOption<A>) => boolean =
  (predicate) => (fa) =>
    isSome(fa) && predicate(fa.value.value);

/**
 * @category Instances
 */
export const getEq = <A>(EA: Eq<A>): Eq<RemoteOption<A>> => ({
  equals: (x, y) =>
    _match(
      x,
      () => isInitial(y),
      () => isPending(y),
      () => isNone(y),
      (ax) => isSome(y) && EA.equals(ax, y.value.value),
    ),
});

/**
 * @category Instances
 */
export const getMonoid = <A>(SA: Semigroup<A>): Monoid<RemoteOption<A>> =>
  remote.getMonoid(o.getMonoid(SA));

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
/**
 * @category Instances
 */
export const getOrd = <A>(OA: Ord<A>): Ord<RemoteOption<A>> => ({
  ...getEq(OA),
  compare: (x, y) =>
    sign(
      _match(
        x,
        () => _match(y, constEq, constLt, constLt, constLt),
        () => _match(y, constGt, constEq, constLt, constLt),
        () => _match(y, constGt, constGt, constEq, constLt),
        (xSome) => _match(y, constGt, constGt, constGt, (ySome) => OA.compare(xSome, ySome)),
      ),
    ),
});

/**
 * @category Instances
 */
export const getShow = <A>(SA: Show<A>): Show<RemoteOption<A>> => ({
  show: match(
    () => 'initial',
    () => 'pending',
    () => `none`,
    (a) => `some(${SA.show(a)})`,
  ),
});

/**
 * @category traversing
 */
export const sequenceS = apply.sequenceS(Apply);

/**
 * @category traversing
 */
export const sequenceT = apply.sequenceT(Apply);

/**
 * The order of parameters `next` and `current` comes from the fact that this is a similar operation
 * to `alt`. Additionally, doing it like this gives us an elegant way of building Dispatches/Reducers,
 * which is a pattern that sees a lot of use in React.
 */
export type RefreshStrategy = <A>(
  next: RemoteOption<A>,
) => (current: RemoteOption<A>) => RemoteOption<A>;

/**
 * @category utils
 */
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

/**
 * @category utils
 */
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
