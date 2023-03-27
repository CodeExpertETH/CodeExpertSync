import { tagged } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { getAccess } from '../api/oauth/getAccess';
import useTimeout from '../ui/hooks/useTimeout';
import { digestMessage, pkceChallenge } from '../utils/crypto';
import { AppId } from './AppId';

export type GlobalAuthState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'authorized', { privateKey: string }>;
export const globalAuthState = tagged.build<GlobalAuthState>();

export type AuthState =
  | tagged.Tagged<'startingAuthorization', { code_verifier: string; redirectLink: string }>
  | tagged.Tagged<'waitingForAuthorization', { code_verifier: string }>
  | tagged.Tagged<'deniedAuthorization'>
  | tagged.Tagged<'timeoutAuthorization'>;
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
  onDenied: () => void,
  onError: (e: Event) => void,
) => {
  console.log('cleanup called');
  sse.current?.removeEventListener('authToken', onAuthToken);
  sse.current?.removeEventListener('denied', onDenied);
  sse.current?.removeEventListener('error', onError);
  sse.current?.close();
  sse.current = null;
};

export const useAuthState = (
  appId: AppId,
  onAuthorize: (privateKey: string) => void,
): {
  state: AuthState;
  startAuthorization: (code_verifier: string) => void;
  cancelAuthorization: () => void;
} => {
  const [state, setState] = React.useState<AuthState>(() => startingAuthorization(appId));
  const sse = React.useRef<EventSource | null>(null);
  useTimeout(() => {
    setState(authState.timeoutAuthorization());
  }, 4 * 60 * 1000);

  React.useEffect(() => {
    const onAuthToken = async ({ data: authToken }: { data: string }) => {
      console.log('on Auth token');
      if (authState.is.waitingForAuthorization(state)) {
        const keys = await api.create_keys();
        const b = await getAccess(appId, state.value.code_verifier, authToken, keys.public_key);
        console.log(b);
        sse.current?.close();
        sse.current = null;
        onAuthorize(keys.private_key);
      } else {
        throw new Error('Invalid state. Please try again.');
      }
    };

    const onDenied = () => {
      if (authState.is.waitingForAuthorization(state)) {
        setState(authState.deniedAuthorization());
      } else {
        throw new Error('Invalid state. Please try again.');
      }
    };
    const onError = (e: Event) => {
      console.log('on error', e);
      throw e;
    };

    if (authState.is.waitingForAuthorization(state)) {
      if (sse.current == null) {
        sse.current = new EventSource(
          `${api.APIUrl}/app/oauth/listenForAuthToken/${digestMessage(appId)}`,
        );
      }
      console.log('register event listener');

      sse.current?.addEventListener('authToken', onAuthToken, { once: true });
      sse.current?.addEventListener('denied', onDenied, { once: true });
      sse.current?.addEventListener('error', onError);
    } else {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
    }
    return () => {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
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
