import React from 'react';
import { pipe, remoteData } from '@code-expert/prelude';
import Loading from './Loading';

const renderLoading = () => <Loading delayTime={200} />;

export interface GuardRemoteProps<A> {
  value: remoteData.Remote<A>;
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
export function GuardRemote<A>(props: GuardRemoteProps<A>) {
  return (
    <GuardRemoteEither
      {...props}
      failure={() => {
        throw new Error('Unexpected failure case in Remote');
      }}
    />
  );
}

export interface GuardRemoteEitherProps<E, A> {
  value: remoteData.RemoteEither<E, A>;
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
  return <>{pipe(value, remoteData.fold(initial, pending, failure, render))}</>;
}
