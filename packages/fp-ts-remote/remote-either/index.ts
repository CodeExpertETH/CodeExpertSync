/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2, Alt2C } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { Applicative2, Applicative2C, Applicative as ApplicativeHKT } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import { Bifunctor2 } from 'fp-ts/Bifunctor';
import * as chainable from 'fp-ts/Chain';
import * as e from 'fp-ts/Either';
import * as eT from 'fp-ts/EitherT';
import { Eq } from 'fp-ts/Eq';
import { Extend2 } from 'fp-ts/Extend';
import { Foldable2 } from 'fp-ts/Foldable';
import * as fe from 'fp-ts/FromEither';
import { Functor2 } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { Monad2 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import * as o from 'fp-ts/Option';
import { Ord } from 'fp-ts/Ord';
import { sign } from 'fp-ts/Ordering';
import { Pointed2 } from 'fp-ts/Pointed';
import { Predicate } from 'fp-ts/Predicate';
import { Semigroup } from 'fp-ts/Semigroup';
import { Show } from 'fp-ts/Show';
import { Traversable2 } from 'fp-ts/Traversable';
import { Zero2 } from 'fp-ts/Zero';
import { LazyArg, constant, flow, identity, pipe } from 'fp-ts/function';
import * as remote from '../remote';

/**
 * TODO: regarding Wide-by-default, Either.ts currently does it as follows:
 * - flatMap (chain) and tap (chainFirst) are wide by default
 * - chain, chainFirst, alt, orElse (recover), match (fold), flatten aren't
 */

/**
 * @category Instances
 */
export const URI = 'RemoteEither';

/**
 * @category Instances
 */
export type URI = typeof URI;

declare module 'fp-ts/HKT' {
  export interface URItoKind2<E, A> {
    RemoteEither: RemoteEither<E, A>;
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
export type Left<E> = remote.Done<e.Left<E>>;
/**
 * @category Model
 */
export type Right<A> = remote.Done<e.Right<A>>;

/**
 * @category Model
 */
export type RemoteEither<E, A> = remote.Remote<e.Either<E, A>>;

/**
 * @category Constructors
 */
export const initial: RemoteEither<never, never> = remote.initial;

/**
 * @category Constructors
 */
export const constInital: <E, A>() => RemoteEither<E, A> = constant(initial);

/**
 * @category Constructors
 */
export const pending: RemoteEither<never, never> = remote.pending;

/**
 * @category Constructors
 */
export const constPending: <E, A>() => RemoteEither<E, A> = constant(pending);

/**
 * @category Constructors
 */
export const left = eT.left(remote.Pointed);

/**
 * @category Constructors
 */
export const right = eT.right(remote.Pointed);

/**
 * @category Constructors
 */
export const of = right;

/**
 * @category Instances
 */
export const Pointed: Pointed2<URI> = {
  URI,
  of,
};

/**
 * @category Constructors
 */
export const zero: <E, A>() => RemoteEither<E, A> = remote.zero;

/**
 * @category Instances
 */
export const Zero: Zero2<URI> = {
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
export const isLeft = remote.exists(e.isLeft);

/**
 * @category Refinements
 */
export const isRight = remote.exists(e.isRight);

/**
 * @category pattern matching
 */
export const match: <E, A, B>(
  onInitial: () => B,
  onPending: () => B,
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
) => (fa: RemoteEither<E, A>) => B = (i, p, l, r) => remote.match(i, p, e.fold(l, r));

/**
 * @category pattern matching
 */
export const matchW: <I, P, E, G, A, B>(
  onInitial: () => I,
  onPending: () => P,
  onLeft: (e: E) => G,
  onRight: (a: A) => B,
) => (fa: RemoteEither<E, A>) => I | P | G | B = (i, p, l, r) =>
  remote.matchW(i, p, e.matchW(l, r));

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
const _match = <E, A, B>(
  fa: RemoteEither<E, A>,
  onInitial: () => B,
  onPending: () => B,
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
) => match(onInitial, onPending, onLeft, onRight)(fa);

/**
 * @category mapping
 */
export const map = eT.map(remote.Functor);

/**
 * @category Instances
 */
export const Functor: Functor2<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f)),
};

/**
 * @category mapping
 */
export const bimap = eT.bimap(remote.Functor);

/**
 * @category mapping
 */
export const mapLeft = eT.mapLeft(remote.Functor);

/**
 * @category Instances
 */
export const Bifunctor: Bifunctor2<URI> = {
  URI,
  bimap: (fa, f, g) => pipe(fa, bimap(f, g)),
  mapLeft: (fa, f) => pipe(fa, mapLeft(f)),
};

/**
 * @category utils
 */
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

/**
 * @category Instances
 */
export const Apply: apply.Apply2<URI> = {
  ...Functor,
  ap: (fab, fa) => pipe(fab, ap(fa)),
};

/**
 * @category Instances
 */
export const Applicative: Applicative2<URI> = {
  ...Apply,
  ...Pointed,
};

/**
 * @category sequencing
 */
export const flatMap: <E2, A, B>(
  f: (a: A) => RemoteEither<E2, B>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> = eT.chain(remote.Monad)<
  any,
  any,
  any
>;

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
export const Chain: chainable.Chain2<URI> = {
  ...Apply,
  chain: (fa, f) => pipe(fa, flatMap(f)),
};

/**
 * @category Instances
 */
export const Monad: Monad2<URI> = {
  ...Chain,
  ...Applicative,
};

/**
 * @category folding
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => <E>(fa: RemoteEither<E, A>) => B =
  (b, f) => (fa) =>
    isRight(fa) ? f(b, fa.value.right) : b;

/**
 * @category folding
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => <E>(fa: RemoteEither<E, A>) => B =
  (b, f) => (fa) =>
    isRight(fa) ? f(fa.value.right, b) : b;

/**
 * @category folding
 */
export const foldMap: <M>(
  M: Monoid<M>,
) => <A>(f: (a: A) => M) => <E>(fa: RemoteEither<E, A>) => M = (M) => (f) => (fa) =>
  isRight(fa) ? f(fa.value.right) : M.empty;

export const Foldable: Foldable2<URI> = {
  URI,
  reduce: (fa, b, f) => pipe(fa, reduce(b, f)),
  reduceRight: (fa, b, f) => pipe(fa, reduceRight(b, f)),
  foldMap: (M) => (fa, f) => pipe(fa, foldMap(M)(f)),
};

/**
 * @category traversing
 */
export const traverse: <F>(
  F: ApplicativeHKT<F>,
) => <A, B>(fab: (a: A) => HKT<F, B>) => <E>(f: RemoteEither<E, A>) => HKT<F, RemoteEither<E, B>> =
  (F) => (fab) => (f) =>
    isRight(f) ? F.map(fab(f.value.right), right) : F.of(f as any);

/**
 * @category traversing
 */
export const sequence: <F>(
  F: ApplicativeHKT<F>,
) => <E, A>(f: RemoteEither<E, HKT<F, A>>) => HKT<F, RemoteEither<E, A>> = (F) =>
  traverse(F)(identity);

/**
 * @category Instances
 */
export const Traversable: Traversable2<URI> = {
  ...Functor,
  ...Foldable,
  sequence,
  traverse:
    <F>(F: ApplicativeHKT<F>) =>
    <E, A, B>(f: RemoteEither<E, A>, fab: (a: A) => HKT<F, B>) =>
      pipe(f, traverse(F)(fab)),
};

/**
 * @category error handling
 */
export const alt = eT.alt(remote.Monad);

/**
 * @category Instances
 */
export const Alt: Alt2<URI> = {
  ...Functor,
  alt: (fa, that) => pipe(fa, alt(that)),
};

/**
 * @category Instances
 */
export const Alternative: Alternative2<URI> = {
  ...Applicative,
  ...Alt,
  ...Zero,
};

/**
 * @category utils
 */
export const extend: <E, A, B>(
  f: (fa: RemoteEither<E, A>) => B,
) => (fa: RemoteEither<E, A>) => RemoteEither<E, B> = (f) => (fa) =>
  isRight(fa) ? right(f(fa)) : (fa as any);

/**
 * @category Instances
 */
export const Extend: Extend2<URI> = {
  ...Functor,
  extend: (wa, f) => pipe(wa, extend(f)),
};

/**
 * @category conversions
 */
export const fromEither: <E, A>(ea: e.Either<E, A>) => RemoteEither<E, A> = remote.of;

/**
 * @category Instances
 */
export const FromEither: fe.FromEither2<URI> = {
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
export const filterOrElse = fe.filterOrElse(FromEither, Chain);

/**
 * @category conversions
 */
export const fromOption = fe.fromOption(FromEither);

/**
 * FIXME This really should be implemented as EitherT.fromNullable(Remote.Pointed), but it's onNull isn't Lazy yet.
 *
 * @category conversions
 */
export const fromNullable =
  <E>(onNull: LazyArg<E>) =>
  <A>(a: A): RemoteEither<E, NonNullable<A>> =>
    a != null ? right(a) : left(onNull());

/**
 * @category conversions
 */
export const fromPredicate = fe.fromPredicate(FromEither);

/**
 * @category conversions
 */
export const fromRemote = eT.rightF(remote.Functor);

/**
 * @category lifting
 */
export const liftEither = fe.fromEitherK(FromEither);

/**
 * Use {@link liftEither}
 *
 * @deprecated
 * @category legacy
 */
export const fromEitherK = liftEither;

/**
 * @category lifting
 */
export const liftOption = fe.fromOptionK(FromEither);

/**
 * Use {@link liftOption}
 *
 * @deprecated
 * @category legacy
 */
export const fromOptionK = liftOption;

/**
 * @category lifting
 */
export const liftNullable = eT.fromNullableK(Pointed);

/**
 * Use {@link liftNullable}
 *
 * @deprecated
 * @category legacy
 */
export const fromNullableK = liftNullable;

/**
 * @category lifting
 */
export const liftRemote = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => remote.Remote<B>,
): (<E = never>(...a: A) => RemoteEither<E, B>) => flow(f, fromRemote);

/**
 * Use {@link liftRemote}
 *
 * @deprecated
 * @category legacy
 */
export const fromRemoteK = liftRemote;

/**
 * @category sequencing
 */
export const flattenW: <E1, E2, A>(
  ffa: RemoteEither<E1, RemoteEither<E2, A>>,
) => RemoteEither<E1 | E2, A> = flatMap(identity);

/**
 * @category sequencing
 */
export const flatten: <E, A>(ffa: RemoteEither<E, RemoteEither<E, A>>) => RemoteEither<E, A> =
  flatMap(identity);

/**
 * @category sequencing
 */
export const flatMapOption = fe.chainOptionK(FromEither, Chain);

/**
 * FIXME Do we want Wide by default?
 *
 * @category sequencing
 */
export const flatMapOptionW: <E2>(
  onNone: LazyArg<E2>,
) => <A, B>(f: (a: A) => o.Option<B>) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> =
  flatMapOption as any;

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
export const flatMapNullable = eT.chainNullableK(remote.Monad);

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
 * FIXME Do we want Wide by default?
 *
 * @category sequencing
 */
export const flatMapEitherW: <E2, A, B>(
  f: (a: A) => e.Either<E2, B>,
) => <E1>(ma: RemoteEither<E1, A>) => RemoteEither<E2 | E1, B> = flatMapEither as any;

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
export const flatMapRemote =
  <A, B>(f: (a: A) => remote.Remote<B>) =>
  <E>(fa: RemoteEither<E, A>): RemoteEither<E, B> =>
    pipe(fa, flatMap(liftRemote(f)<E>));

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
export const tapOption: <E>(
  onNone: LazyArg<E>,
) => <A>(f: (a: A) => o.Option<unknown>) => (fa: RemoteEither<E, A>) => RemoteEither<E, A> = (
  onNone,
) => flow(liftOption(onNone), tap);

/**
 * FIXME this implementation is "elegant", but also illegible. is there a name for what I'm trying to do here?
 *
 * @category sequencing
 */
export const tapOption2: <E>(
  onNone: LazyArg<E>,
) => <A>(f: (a: A) => o.Option<unknown>) => (fa: RemoteEither<E, A>) => RemoteEither<E, A> = flow(
  liftOption,
  (x) => flow(x, tap),
);

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
export const tapRemote =
  <A>(f: (a: A) => remote.Remote<unknown>) =>
  <E>(fa: RemoteEither<E, A>): RemoteEither<E, A> =>
    pipe(fa, tap(liftRemote(f)<E>));

/**
 * Use {@link tapRemote}
 *
 * @deprecated
 * @category legacy
 */
export const chainFirstRemoteK = tapRemote;

/**
 * @category error handling
 */
export const altValidation = <E>(S: Semigroup<E>) => eT.altValidation(remote.Monad, S);

/**
 * @category error handling
 */
export const orElse = eT.orElse(remote.Monad);

/**
 * @category error handling
 */
export const orElseW: <E1, E2, B>(
  onLeft: (e: E1) => RemoteEither<E2, B>,
) => <A>(fa: RemoteEither<E1, A>) => RemoteEither<E2, B | A> = orElse as any;

/**
 * FIXME what the hell does this even do??????
 */
// const orElseFirst = eT.orElseFirst(remote.Monad);

/**
 * @category Destructors
 */
export const match3 = <E, A, R>(onNone: LazyArg<R>, onLeft: (e: E) => R, onRight: (a: A) => R) =>
  match(onNone, onNone, onLeft, onRight);

/**
 * @category Destructors
 */
export const getOrElseW: <E, B>(onNone: LazyArg<B>) => <A>(fa: RemoteEither<E, A>) => A | B =
  (onNone) => (fa) =>
    isRight(fa) ? fa.value.right : onNone();

/**
 * @category Destructors
 */
export const getOrElse =
  <E, A>(onNone: LazyArg<A>) =>
  <A>(fa: RemoteEither<E, A>) =>
    getOrElseW(onNone)(fa);

/**
 * @category Destructors
 */
export const toNullable = <E, A>(ma: RemoteEither<E, A>): A | null =>
  isRight(ma) ? ma.value.right : null;

/**
 * @category Destructors
 */
export const toUndefined = <E, A>(ma: RemoteEither<E, A>): A | undefined =>
  isRight(ma) ? ma.value.right : undefined;

/**
 * @category Destructors
 */
export const toOption = <E, A>(fa: RemoteEither<E, A>): o.Option<A> =>
  isRight(fa) ? o.some(fa.value.right) : o.none;

/**
 * @category Destructors
 */
export const toEither = <E>(
  onInitial: () => E,
  onPending: () => E,
): (<A>(fa: RemoteEither<E, A>) => e.Either<E, A>) =>
  remote.fold(flow(onInitial, e.left), flow(onPending, e.left), identity);

/**
 * @category utils
 */
export const elem: <A>(E: Eq<A>) => (a: A) => <E>(fa: RemoteEither<E, A>) => boolean =
  (E) => (a) => (fa) =>
    isRight(fa) && E.equals(fa.value.right, a);

/**
 * @category utils
 */
export const exists: <A>(predicate: Predicate<A>) => (fa: RemoteEither<unknown, A>) => boolean =
  (predicate) => (fa) =>
    isRight(fa) && predicate(fa.value.right);

/**
 * @category Instances
 */
export const getApplicativeValidation: <E>(SE: Semigroup<E>) => Applicative2C<URI, E> = (SE) => ({
  ...Applicative,
  _E: undefined as any,
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

/**
 * FIXME Write tests!!!
 *
 * @category Instances
 */
export const getAltValidation: <E>(SE: Semigroup<E>) => Alt2C<URI, E> = (SE) => ({
  ...Alt,
  _E: undefined as any,
  alt: (first, getSecond) => {
    if (isInitial(first)) {
      return getSecond();
    } else if (isPending(first)) {
      const second = getSecond();
      return isInitial(second) ? first : second;
    } else {
      if (e.isLeft(first.value)) {
        const second = getSecond();
        return isLeft(second)
          ? left(SE.concat(first.value.left, second.value.left))
          : isRight(second)
          ? second
          : first;
      } else {
        return first;
      }
    }
  },
});

/**
 * @category Instances
 */
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

/**
 * @category Instances
 */
export const getMonoid = <E, A>(SA: Semigroup<A>): Monoid<RemoteEither<E, A>> =>
  remote.getMonoid(e.getSemigroup(SA));

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
/**
 * @category Instances
 */
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

/**
 * @category Instances
 */
export const getShow = <E, A>(SE: Show<E>, SA: Show<A>): Show<RemoteEither<E, A>> => ({
  show: match(
    () => 'initial',
    () => 'pending',
    (e) => `left(${SE.show(e)})`,
    (a) => `right(${SA.show(a)})`,
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
export type RefreshStrategy = <E, A>(
  next: RemoteEither<E, A>,
) => (current: RemoteEither<E, A>) => RemoteEither<E, A>;

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
      () => (isInitial(current) || isLeft(current) ? next : current),
      () => (isRight(current) ? current : next),
      () => next,
    ),
  );
