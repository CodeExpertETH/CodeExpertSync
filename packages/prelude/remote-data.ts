import * as RD from '@devexperts/remote-data-ts';
import * as Ap from 'fp-ts/Apply';
import * as predicate from 'fp-ts/Predicate';
import * as refinement from 'fp-ts/Refinement';
import { FunctionN } from 'fp-ts/function';

export * from '@devexperts/remote-data-ts';
export * from './refresh-remote-data';

export type RemoteDataA<A> = RD.RemoteData<never, A>;

export type RemoteDataOption<A> = RD.RemoteData<undefined, A>;

export const chainW =
  <D, A, B>(f: (a: A) => RD.RemoteData<D, B>) =>
  <E>(ma: RD.RemoteData<E, A>): RD.RemoteData<D | E, B> => {
    if (RD.isFailure(ma)) return ma;
    if (RD.isSuccess(ma)) return f(ma.value);
    return ma;
  };

export const fromNullable =
  <L, A>(whenFalse: FunctionN<[A], L>): FunctionN<[A], RD.RemoteData<L, NonNullable<A>>> =>
  (a) =>
    a != null ? RD.success(a as NonNullable<A>) : RD.failure(whenFalse(a));

export const filterOrElse: {
  <E, A, B extends A>(refinement: refinement.Refinement<A, B>, onFalse: (a: A) => E): (
    ma: RD.RemoteData<E, A>,
  ) => RD.RemoteData<E, B>;
  <E, A>(predicate: predicate.Predicate<A>, onFalse: (a: A) => E): (
    ma: RD.RemoteData<E, A>,
  ) => RD.RemoteData<E, A>;
} =
  <E, A, B extends A>(
    pred: refinement.Refinement<A, B> | predicate.Predicate<A>,
    onFalse: (a: A) => E,
  ) =>
  (rd: RD.RemoteData<E, A>) => {
    if (RD.isSuccess(rd)) return pred(rd.value) ? rd : RD.failure(onFalse(rd.value));
    return rd;
  };

export const filterOrPending: {
  <E, A, B extends A>(refinement: refinement.Refinement<A, B>): (
    ma: RD.RemoteData<E, A>,
  ) => RD.RemoteData<E, B>;
  <E, A>(predicate: predicate.Predicate<A>): (ma: RD.RemoteData<E, A>) => RD.RemoteData<E, A>;
} =
  <E, A, B extends A>(pred: refinement.Refinement<A, B> | predicate.Predicate<A>) =>
  (rd: RD.RemoteData<E, A>) => {
    if (RD.isSuccess(rd)) return pred(rd.value) ? rd : RD.pending;
    return rd;
  };

export const sequenceS = Ap.sequenceS(RD.remoteData);

export const sequenceT = Ap.sequenceT(RD.remoteData);

export const of = RD.success;
