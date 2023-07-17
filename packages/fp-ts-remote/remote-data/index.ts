/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt2 } from 'fp-ts/Alt';
import { Alternative2 } from 'fp-ts/Alternative';
import { getApplySemigroup } from 'fp-ts/Apply';
import { Bifunctor2 } from 'fp-ts/Bifunctor';
import { Extend2 } from 'fp-ts/Extend';
import { Foldable2 } from 'fp-ts/Foldable';
import { Monad2 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import { Option, fold as foldOption } from 'fp-ts/Option';
import { Semigroup } from 'fp-ts/Semigroup';
import { Traversable2 } from 'fp-ts/Traversable';
import { pipe } from 'fp-ts/function';
import * as remoteEither from '../remote-either';

// TODO Compactable, Filterable, MonadThrow, Witherable

export {
  left as failure,
  right as success,
  pending,
  // TODO progress
  initial,
  isRight as isSuccess,
  isPending,
  isInitial,
  getOrElse,
  fold as fold,
  match3 as fold3,
  toNullable,
  toUndefined,
  fromOption,
  toOption,
  fromEither,
  toEither,
  fromPredicate,
  // TODO fromProgressEvent
  getEq,
  getOrd,
  getShow,
  sequenceT as combine,

  // extra
  chain as chain,
  chain as chainW,
  fromNullable,
  filterOrElse,
  staleWhileRevalidate,
  staleIfError,
  sequenceT,
  sequenceS,
} from '../remote-either';

export type {
  Initial as RemoteInitial,
  Pending as RemotePending,
  Left as RemoteFailure,
  Right as RemoteSuccess,
  RefreshStrategy,
} from '../remote-either';

export const URI = remoteEither.URI;
export type URI = remoteEither.URI;

export type RemoteData<E, A> = remoteEither.RemoteEither<E, A>;

export const recover =
  <E, A>(onLeft: (e: E) => Option<A>) =>
  (fa: RemoteData<E, A>): RemoteData<E, A> =>
    remoteEither.isLeft(fa)
      ? pipe(
          onLeft(fa.value.left),
          foldOption(() => fa, remoteEither.right<A, E>),
        )
      : fa;
export const recoverMap =
  <E, A, B>(onLeft: (e: E) => Option<B>, fab: (a: A) => B) =>
  (fa: RemoteData<E, A>): RemoteData<E, B> =>
    pipe(
      fa,
      remoteEither.fold(
        () => remoteEither.initial,
        () => remoteEither.pending,
        (e) =>
          pipe(
            onLeft(e),
            foldOption(() => fa as any, remoteEither.right<B, E>),
          ),
        (a) => remoteEither.right(fab(a)),
      ),
    );

export const getSemigroup = <E, A>(
  SE: Semigroup<E>,
  SA: Semigroup<A>,
): Semigroup<RemoteData<E, A>> => getApplySemigroup(remoteEither.getApplicativeValidation(SE))(SA);

export const getMonoid = <E, A>(SE: Semigroup<E>, SA: Semigroup<A>): Monoid<RemoteData<E, A>> => ({
  ...getSemigroup(SE, SA),
  empty: remoteEither.initial,
});

export const remoteData: Monad2<URI> &
  Foldable2<URI> &
  Traversable2<URI> &
  Bifunctor2<URI> &
  Alt2<URI> &
  Extend2<URI> &
  Alternative2<URI> = {
  URI,
  of: remoteEither.of,
  ap: remoteEither.Monad.ap,
  map: remoteEither.Functor.map,
  chain: remoteEither.Monad.chain,
  reduce: remoteEither.Foldable.reduce,
  reduceRight: remoteEither.Foldable.reduceRight,
  foldMap: remoteEither.Foldable.foldMap,
  traverse: remoteEither.Traversable.traverse,
  sequence: remoteEither.Traversable.sequence,
  bimap: remoteEither.Bifunctor.bimap,
  mapLeft: remoteEither.Bifunctor.mapLeft,
  alt: remoteEither.Alt.alt,
  zero: remoteEither.Alternative.zero,
  extend: remoteEither.Extend.extend,
};
