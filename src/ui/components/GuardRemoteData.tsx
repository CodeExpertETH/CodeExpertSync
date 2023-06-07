import { Result } from 'antd';
import React from 'react';
import { pipe, remoteData } from '@code-expert/prelude';
import { Exception } from '@/domain/exception';
import Loading from './Loading';

const renderLoading = () => <Loading delayTime={200} />;

const renderFailure = (error: Exception) => (
  <Result status="error" title="An error occurred" subTitle={error.message} />
);

export interface GuardRemoteDataProps<A> {
  value: remoteData.RemoteData<Exception, A>;
  /* Renders only if all values are non-nullable */
  render(a: A): React.ReactNode;
  /* Renders a fallback if in unasked state */
  initial?(): React.ReactNode;
  /* Renders a fallback if in loading state */
  pending?(): React.ReactNode;
  /* Renders on error */
  failure?(e: Exception): React.ReactNode;
}

/**
 * Guard a render tree from rendering unless we have a value
 */
export function GuardRemoteData<A>({
  value,
  render,
  pending = renderLoading,
  initial = pending,
  failure = renderFailure,
}: GuardRemoteDataProps<A>) {
  return <>{pipe(value, remoteData.fold(initial, pending, failure, render))}</>;
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
export function GuardRemoteEitherData<E, A>({
  value,
  render,
  failure,
  pending = renderLoading,
  initial = pending,
}: GuardRemoteDataEitherProps<E, A>) {
  return <>{pipe(value, remoteData.fold(initial, pending, failure, render))}</>;
}
