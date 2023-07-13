import React from 'react';
import { pipe, remote, remoteEither } from '@code-expert/prelude';
import Loading from './Loading';

const renderLoading = () => <Loading delayTime={200} />;

export interface GuardRemoteProps<A> {
  value: remote.Remote<A>;
  /* Renders only if all values are non-nullable */
  render(a: A): React.ReactNode;
  /* Renders a fallback if in unasked state */
  initial?(): React.ReactNode;
  /* Renders a fallback if in loading state */
  pending?(): React.ReactNode;
}

/**
 * Guard a render tree from rendering unless we have a value
 */
export function GuardRemote<A>({
  value,
  render,
  pending = renderLoading,
  initial = pending,
}: GuardRemoteProps<A>) {
  return <>{pipe(value, remote.match(initial, pending, render))}</>;
}

export interface GuardRemoteEitherProps<E, A> {
  value: remoteEither.RemoteEither<E, A>;
  /* Renders only if all values are non-nullable */
  render(a: A): React.ReactNode;
  /* Renders on error */
  failure(e: E): React.ReactNode;
  /* Renders a fallback if in unasked state */
  initial?(): React.ReactNode;
  /* Renders a fallback if in loading state */
  pending?(): React.ReactNode;
}

/**
 * Guard a render tree from rendering unless we have a value
 */
export function GuardRemoteEither<E, A>({
  value,
  render,
  failure,
  pending = renderLoading,
  initial = pending,
}: GuardRemoteEitherProps<E, A>) {
  return <>{pipe(value, remoteEither.match(initial, pending, failure, render))}</>;
}
