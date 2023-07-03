import React from 'react';
import { pipe, remoteData } from '@code-expert/prelude';
import Loading from './Loading';

const renderLoading = () => <Loading delayTime={200} />;

export interface GuardRemoteDataPropsA<A> {
  value: remoteData.RemoteDataA<A>;
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
export function GuardRemoteDataA<A>({
  value,
  render,
  pending = renderLoading,
  initial = pending,
}: GuardRemoteDataPropsA<A>) {
  return (
    <GuardRemoteDataEither
      value={value}
      initial={initial}
      pending={pending}
      render={render}
      failure={() => {
        throw new Error('Unexpected failure case in RemoteDataA');
      }}
    />
  );
}

export interface GuardRemoteDataEitherProps<E, A> {
  value: remoteData.RemoteData<E, A>;
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
export function GuardRemoteDataEither<E, A>({
  value,
  render,
  failure,
  pending = renderLoading,
  initial = pending,
}: GuardRemoteDataEitherProps<E, A>) {
  return <>{pipe(value, remoteData.fold(initial, pending, failure, render))}</>;
}
