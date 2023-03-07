import { pipe } from 'fp-ts/function';
import * as RD from '@devexperts/remote-data-ts';

/**
 * The order of parameters `next` and `current` comes from the fact that this is a similar operation
 * to `alt`. Additionally, doing it like this gives us an elegant way of building Dispatches/Reducers,
 * which is a pattern that sees a lot of use in React.
 */
export type RefreshStrategy = <E, A>(
  next: RD.RemoteData<E, A>,
) => (current: RD.RemoteData<E, A>) => RD.RemoteData<E, A>;

export const staleWhileRevalidate: RefreshStrategy = (next) => (current) =>
  pipe(
    next,
    RD.fold(
      () => current,
      () => (RD.isInitial(current) ? next : current),
      () => next,
      () => next,
    ),
  );

export const staleIfError: RefreshStrategy = (next) => (current) =>
  pipe(
    next,
    RD.fold(
      () => current,
      () => (RD.isInitial(current) || RD.isFailure(current) ? next : current),
      () => (RD.isSuccess(current) ? current : next),
      () => next,
    ),
  );
