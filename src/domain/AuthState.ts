import { api } from 'api';
import React from 'react';
import { pipe, tagged, task } from '@code-expert/prelude';
import { getAccess } from '@/api/oauth/getAccess';
import { config } from '@/config';
import useTimeout from '@/ui/hooks/useTimeout';
import { pkceChallenge } from '@/utils/crypto';
import { ClientId } from './ClientId';

export type AuthState =
  | tagged.Tagged<'startingAuthorization', { code_verifier: string; redirectLink: string }>
  | tagged.Tagged<'waitingForAuthorization', { code_verifier: string }>
  | tagged.Tagged<'deniedAuthorization'>
  | tagged.Tagged<'timeoutAuthorization'>;
export const authState = tagged.build<AuthState>();

const startingAuthorization = (
  clientId: ClientId,
): Extract<AuthState, { _tag: 'startingAuthorization' }> => {
  const { code_verifier, code_challenge } = pkceChallenge();

  const redirectLink = `${config.CX_WEB_URL}/app/authorize?clientId=${clientId}&code_challenge=${code_challenge}`;

  return authState.startingAuthorization({ code_verifier, redirectLink });
};

const cleanUpEventListener = (
  sse: React.MutableRefObject<EventSource | null>,
  onAuthToken: ({ data }: { data: string }) => Promise<void>,
  onDenied: () => void,
  onError: (e: Event) => void,
) => {
  sse.current?.removeEventListener('authToken', onAuthToken);
  sse.current?.removeEventListener('denied', onDenied);
  sse.current?.removeEventListener('error', onError);
  sse.current?.close();
  sse.current = null;
};

export const useAuthState = (
  clientId: ClientId,
  onAuthorize: () => void,
): {
  state: AuthState;
  startAuthorization: (code_verifier: string) => void;
  cancelAuthorization: () => void;
} => {
  const [state, setState] = React.useState<AuthState>(() => startingAuthorization(clientId));
  const sse = React.useRef<EventSource | null>(null);
  useTimeout(() => {
    setState(authState.timeoutAuthorization());
  }, 4 * 60 * 1000);

  React.useEffect(() => {
    const onAuthToken = async ({ data: authToken }: { data: string }) => {
      if (authState.is.waitingForAuthorization(state)) {
        await pipe(
          api.create_keys,
          task.chain((publicKey) =>
            getAccess(clientId, state.value.code_verifier, authToken, publicKey),
          ),
          task.run,
        );
        sse.current?.close();
        sse.current = null;
        onAuthorize();
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
      throw e;
    };

    if (authState.is.waitingForAuthorization(state)) {
      if (sse.current == null) {
        sse.current = new EventSource(
          `${config.CX_API_URL}/app/oauth/listenForAuthToken/${clientId}`,
        );
      }

      sse.current?.addEventListener('authToken', onAuthToken, { once: true });
      sse.current?.addEventListener('denied', onDenied, { once: true });
      sse.current?.addEventListener('error', onError);
    } else {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
    }
    return () => {
      cleanUpEventListener(sse, onAuthToken, onDenied, onError);
    };
  }, [state, clientId, onAuthorize]);

  const { startAuthorization, cancelAuthorization } = React.useMemo(() => {
    const startAuthorization = (code_verifier: string) => {
      setState(authState.waitingForAuthorization({ code_verifier }));
    };

    const cancelAuthorization = () => {
      setState(startingAuthorization(clientId));
    };
    return {
      startAuthorization,
      cancelAuthorization,
    };
  }, [clientId]);

  return { state, startAuthorization, cancelAuthorization };
};
