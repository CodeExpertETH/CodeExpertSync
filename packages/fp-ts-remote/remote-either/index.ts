/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2 } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { Applicative2 } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import { Apply2 } from 'fp-ts/Apply';
import { Chain2 } from 'fp-ts/Chain';
import * as e from 'fp-ts/Either';
import * as eT from 'fp-ts/EitherT';
import { Eq } from 'fp-ts/Eq';
import { Functor2 } from 'fp-ts/Functor';
import { Monad2 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import { Option } from 'fp-ts/Option';
import { Pointed1 } from 'fp-ts/Pointed';
import { Semigroup } from 'fp-ts/Semigroup';
import { Zero2 } from 'fp-ts/Zero';
import { LazyArg, constant, flow, pipe } from 'fp-ts/function';
import * as remote from './remote';

export const URI = 'RemoteEither';
export type URI = typeof URI;
declare module 'fp-ts/HKT' {
  export interface URItoKind2<E, A> {
    RemoteEither: RemoteEither<E, A>;
  }
}

export type RemoteEither<E, A> = remote.Remote<e.Either<E, A>>;

export const alt = eT.alt(remote.Monad);
export const altValidation = <E>(S: Semigroup<E>) => eT.altValidation(remote.Monad, S);
export const bimap = eT.bimap(remote.Functor);
export const flatMap = eT.chain(remote.Monad);
export const chain = flatMap;
export const chainNullableK = eT.chainNullableK(remote.Monad);
export const fromNullable = eT.fromNullable(remote.Pointed);
export const fromNullableK = eT.fromNullableK(remote.Pointed);
export const getOrElse = eT.getOrElse(remote.Monad);
export const left = eT.left(remote.Pointed);
export const map = eT.map(remote.Functor);
export const mapLeft = eT.mapLeft(remote.Functor);
export const match = eT.match(remote.Functor);
export const matchE = eT.matchE(remote.Chain);
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
) => <A, B>(f: (a: A) => Option<B>) => (fa: RemoteEither<E, A>) => RemoteEither<E, B> =
  (onNone) => (f) =>
    remote.map(e.chainOptionK(onNone)(f));

export const chainOptionKW: <E2>(
  onNone: LazyArg<E2>,
) => <A, B>(f: (a: A) => Option<B>) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> =
  (onNone) => (f) =>
    remote.map(e.chainOptionKW(onNone)(f));

export const chainRemoteK: <A, B>(
  f: (a: A) => remote.Remote<B>,
) => <E>(fa: RemoteEither<E, A>) => RemoteEither<E, B> = <A, B>(f: (a: A) => remote.Remote<B>) =>
  chain(flow(f, remote.map(e.right<any, B>)));

export const fold: <E, A, B>(
  onInitial: () => B,
  onPending: () => B,
  onLeft: (e: E) => B,
  onRight: (a: A) => B,
) => (fa: RemoteEither<E, A>) => B = (i, p, l, r) => remote.fold(i, p, e.fold(l, r));

const _ap: Apply2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _map: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _chain: Chain2<URI>['chain'] = (fa, f) => pipe(fa, chain(f));
const _alt: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));

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

export const Chain: Chain2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
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

export const Zero: Zero2<URI> = {
  URI,
  zero,
};

export const getEq = <E, A>(EE: Eq<E>, EA: Eq<A>): Eq<RemoteEither<E, A>> => ({
  equals: (x, y) =>
    pipe(
      x,
      fold(
        () => isInitial(y),
        () => isPending(y),
        (ex) => isLeft(y) && EE.equals(ex, y.value.left),
        (ax) => isRight(y) && EA.equals(ax, y.value.right),
      ),
    ),
});

export const getMonoid = <E, A>(
  SE: Semigroup<E>,
  SA: Semigroup<A>,
): Monoid<RemoteEither<E, A>> => ({
  concat: remote.getMonoid(e.getSemigroup()),
  empty: initial,
});

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
export const getOrd = <A>(OA: Ord<A>): Ord<Remote<A>> => ({
  ...getEq(OA),
  compare: (x, y) =>
    sign(
      pipe(
        x,
        fold(
          () => pipe(y, fold(constEq, constLt, constLt)),
          () => pipe(y, fold(constGt, constEq, constLt)),
          (xValue) =>
            pipe(
              y,
              fold(constGt, constGt, (yValue) => OA.compare(xValue, yValue)),
            ),
        ),
      ),
    ),
});

export const getShow = <A>(SA: Show<A>): Show<Remote<A>> => ({
  show: fold(
    () => 'initial',
    () => 'pending',
    (a) => `done(${SA.show(a)})`,
  ),
});

export const sequenceS = apply.sequenceS(Apply);

export const sequenceT = apply.sequenceT(Apply);
