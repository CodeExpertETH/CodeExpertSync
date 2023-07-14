/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2 } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { Applicative2 } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import { Apply2 } from 'fp-ts/Apply';
import { Chain2 } from 'fp-ts/Chain';
import * as e from 'fp-ts/Either';
import * as eT from 'fp-ts/EitherT';
import { Functor2 } from 'fp-ts/Functor';
import { Option } from 'fp-ts/Option';
import { Semigroup } from 'fp-ts/Semigroup';
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
export const ap = eT.ap(remote.Apply);
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

export const chainW: <E2, A, B>(
  f: (a: A) => RemoteEither<E2, B>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, B> = chain<any, any, any>;

export const chainFirst: <A, E>(
  f: (a: A) => RemoteEither<E, unknown>,
) => (fa: RemoteEither<E, A>) => RemoteEither<E, A> = (f) => chain((a) => map_(f(a), () => a));

export const chainFirstW: <A, E2>(
  f: (a: A) => RemoteEither<E2, unknown>,
) => <E1>(fa: RemoteEither<E1, A>) => RemoteEither<E1 | E2, A> = (f) =>
  chainW((a) => map_(f(a), () => a));

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

const ap_: Apply2<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const map_: Functor2<URI>['map'] = (fa, f) => pipe(fa, map(f));
const chain_: Chain2<URI>['chain'] = (fa, f) => pipe(fa, chain(f));
const alt_: Alt2<URI>['alt'] = (fa, that) => pipe(fa, alt(that));

export const Alt: Alt2<URI> = {
  URI,
  map: map_,
  alt: alt_,
};

export const Alternative: Alternative2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  alt: alt_,
  of,
  zero,
};

export const Applicative: Applicative2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
};

export const Apply: apply.Apply2<URI> = {
  URI,
  map: map_,
  ap: ap_,
};

export const Chain: Chain2<URI> = {
  URI,
  map: map_,
  ap: ap_,
  chain: chain_,
};

export const Functor: Functor2<URI> = {
  URI,
  map: map_,
};

export const sequenceS = apply.sequenceS(Apply);

export const sequenceT = apply.sequenceT(Apply);
