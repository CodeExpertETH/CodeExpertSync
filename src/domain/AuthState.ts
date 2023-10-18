import { api } from 'api';
import React from 'react';
import { constVoid, flow, pipe, tagged, task, taskEither } from '@code-expert/prelude';
import { getAccess } from '@/api/oauth/getAccess';
import { config } from '@/config';
import { notification } from '@/ui/helper/notifications';
import useTimeout from '@/ui/hooks/useTimeout';
import { apiErrorToMessage } from '@/utils/api';
import { pkceChallenge } from '@/utils/crypto';
import { panic } from '@/utils/error';
import { ClientId } from './ClientId';

export type AuthState =
  | tagged.Tagged<'startingAuthorization', { codeVerifier: string; codeChallenge: string }>
  | tagged.Tagged<'waitingForAuthorization', { codeVerifier: string; clientId: ClientId }>
  | tagged.Tagged<'deniedAuthorization'>
  | tagged.Tagged<'timeoutAuthorization'>;
export const authState = tagged.build<AuthState>();

const startingAuthorization = (): Extract<AuthState, { _tag: 'startingAuthorization' }> => {
  const { codeVerifier, codeChallenge } = pkceChallenge();
  return authState.startingAuthorization({ codeVerifier, codeChallenge });
};

const cleanUpEventListener = (
  sse: React.MutableRefObject<EventSource | null>,
  onAuthToken: ({ data }: { data: string }) => Promise<void>,
  onDenied: () => void,
  onError: () => void,
) => {
  sse.current?.removeEventListener('granted', onAuthToken);
  sse.current?.removeEventListener('denied', onDenied);
  sse.current?.removeEventListener('error', onError);
  sse.current?.close();
  sse.current = null;
};

export const getRedirectLink = (clientId: ClientId, codeChallenge: string) =>
  `${config.CX_WEB_URL}/app/authorize?clientId=${clientId}&code_challenge=${codeChallenge}`;

export const useAuthState = (
  onAuthorize: (clientId: ClientId) => void,
): {
  state: AuthState;
  startAuthorization: (clientId: ClientId, code_verifier: string) => void;
  cancelAuthorization: () => void;
} => {
  const [state, setState] = React.useState<AuthState>(() => startingAuthorization());
  const sse = React.useRef<EventSource | null>(null);
  useTimeout(
    () => {
      setState(authState.timeoutAuthorization());
    },
    4 * 60 * 1000,
  );

  React.useEffect(() => {
    const onAuthToken = async ({ data: authToken }: { data: string }) => {
      if (authState.is.waitingForAuthorization(state)) {
        const { codeVerifier, clientId } = state.value;
        await pipe(
          api.create_keys,
          task.chain((publicKey) => getAccess(clientId, codeVerifier, authToken, publicKey)),
          taskEither.match(flow(apiErrorToMessage, panic), constVoid),
          task.toPromise,
        );
        sse.current?.close();
        sse.current = null;
        onAuthorize(clientId);
      } else {
        panic('Invalid state. Please try again.');
      }
    };

    const onDenied = () => {
      if (authState.is.waitingForAuthorization(state)) {
        setState(authState.deniedAuthorization());
      } else {
        panic('Invalid state. Please try again.');
      }
    };
    const onError = function (this: EventSource) {
      notification.warning(
        'Our servers are unreachable. Check your internet connection and/or try again later.',
        10,
      );
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
      setState(startingAuthorization());
    };

    if (authState.is.waitingForAuthorization(state)) {
      if (sse.current == null) {
        sse.current = new EventSource(
          `${config.CX_API_URL}/access/authorize?clientId=${state.value.clientId}`,
        );
      }

      sse.current?.addEventListener('granted', onAuthToken, { once: true });
      sse.current?.addEventListener('denied', onDenied, { once: true });
      sse.current?.addEventListener('error', onError);
    } else {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
    }
    return () => {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
    };
  }, [state, onAuthorize]);

  const { startAuthorization, cancelAuthorization } = React.useMemo(() => {
    const startAuthorization = (clientId: ClientId, codeVerifier: string) => {
      setState(authState.waitingForAuthorization({ codeVerifier, clientId }));
    };

    const cancelAuthorization = () => {
      setState(startingAuthorization());
    };
    return {
      startAuthorization,
      cancelAuthorization,
    };
  }, []);

  return { state, startAuthorization, cancelAuthorization };
};
