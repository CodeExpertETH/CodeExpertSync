import { tagged } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { getAccessToken } from '../../api/oauth/getAccessToken';
import { AppId } from '../../domain/AppId';
import { AccessToken } from '../../domain/AuthToken';
import { digestMessage, pkceChallenge } from '../../utils/crypto';

export type GlobalAuthState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'authorized', { accessToken: AccessToken }>;
export const globalAuthState = tagged.build<GlobalAuthState>();

export type AuthState =
  | tagged.Tagged<'startingAuthorization', { code_verifier: string; redirectLink: string }>
  | tagged.Tagged<'waitingForAuthorization', { code_verifier: string }>;
export const authState = tagged.build<AuthState>();

const startingAuthorization = (
  appIdentifier: AppId,
): Extract<AuthState, { _tag: 'startingAuthorization' }> => {
  const { code_verifier, code_challenge } = pkceChallenge();

  const redirectLink = `${api.CXUrl}/app/authorize?appIdentifier=${digestMessage(
    appIdentifier,
  )}&code_challenge=${code_challenge}`;

  return authState.startingAuthorization({ code_verifier, redirectLink });
};

const cleanUpEventListener = (
  sse: React.MutableRefObject<EventSource | null>,
  onAuthToken: ({ data }: { data: string }) => Promise<void>,
  onError: (e: Event) => void,
) => {
  sse.current?.removeEventListener('authToken', onAuthToken);
  sse.current?.removeEventListener('error', onError);
  sse.current?.close();
  sse.current = null;
};

export const useAuthState = (
  appId: AppId,
  onAuthorize: (accessToken: AccessToken) => void,
): {
  state: AuthState;
  startAuthorization: (code_verifier: string) => void;
  cancelAuthorization: () => void;
} => {
  const [state, setState] = React.useState<AuthState>(() => startingAuthorization(appId));
  const sse = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    const onAuthToken = async ({ data: authToken }: { data: string }) => {
      if (authState.is.waitingForAuthorization(state)) {
        const accessToken = await getAccessToken(appId, state.value.code_verifier, authToken);
        sse.current?.close();
        sse.current = null;
        onAuthorize(accessToken);
      } else {
        throw new Error('Invalid state. Please try again.');
      }
    };
    const onError = (e: Event) => {
      throw e;
    };

    if (authState.is.waitingForAuthorization(state)) {
      if (sse.current == null) {
        sse.current = new EventSource(
          `${api.APIUrl}/app/oauth/listenForAuthToken/${digestMessage(appId)}`,
        );
      }

      sse.current?.addEventListener('authToken', onAuthToken, { once: true });
      sse.current?.addEventListener('error', onError);
    } else {
      cleanUpEventListener(sse, onAuthToken, onError);
    }
    return () => {
      cleanUpEventListener(sse, onAuthToken, onError);
    };
  }, [state, appId, onAuthorize]);

  const { startAuthorization, cancelAuthorization } = React.useMemo(() => {
    const startAuthorization = (code_verifier: string) => {
      setState(authState.waitingForAuthorization({ code_verifier }));
    };

    const cancelAuthorization = () => {
      setState(startingAuthorization(appId));
    };
    return {
      startAuthorization,
      cancelAuthorization,
    };
  }, [appId]);

  return { state, startAuthorization, cancelAuthorization };
};
