import React from 'react';
import { throttle } from 'throttle-debounce';
import { pipe, remoteEither, tagged, task, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { ApiConnectionAtom } from '@/infrastructure/tauri/ApiConnectionRepository';
import { panic } from '@/utils/error';
import { createToken } from '@/utils/jwt';

export type SSEException = tagged.Tagged<'disconnected'>;
export const sseExceptionADT = tagged.build<SSEException>();

// TODO: this return value is no longer used, get rid of it
export const useProjectEventUpdate = (
  onProjectAccessGranted: () => void,
  clientId: ClientId,
  apiConnectionAtom: ApiConnectionAtom,
): remoteEither.RemoteEither<SSEException, EventSource> => {
  const sse = React.useRef<EventSource | null>(null);
  // TODO: this doesn't need to be more than a Option<SseException>. Separate this hook into useEventSource(...): RemoteEither<SSEException, EventSource> and useEventListener(eventSource, 'projectAccess', onProjectAccessGranted)
  const [sseStatus, setSseStatus] = React.useState<
    remoteEither.RemoteEither<SSEException, EventSource>
  >(remoteEither.initial);

  React.useEffect(() => {
    let retryCount = 0;

    const onConnect = function (this: EventSource) {
      apiConnectionAtom.set('connected');
      retryCount = 0;
      setSseStatus(remoteEither.right(this));
    };

    const onDisconnect = () => {
      setSseStatus(remoteEither.initial);
    };

    const onProjectAccess = throttle(1000, onProjectAccessGranted, { noLeading: true });

    let timeout: NodeJS.Timeout | null = null;
    const registerEventSource = () => {
      if (sse.current == null) {
        retryCount += 1;
        pipe(
          createToken(clientId)(),
          taskEither.getOrElse(panic),
          task.map((token) => {
            if (sse.current == null) {
              setSseStatus(remoteEither.pending);
              sse.current = new EventSource(`${config.CX_API_URL}/projectAccess?token=${token}`);
              sse.current.addEventListener('projectAccess', onProjectAccess);
              sse.current.addEventListener('error', onError);
              sse.current.addEventListener('open', onConnect);
              sse.current.addEventListener('close', onDisconnect);
            }
          }),
          task.run,
        );
      }
    };

    const onError = (_e: Event) => {
      cleanUp();
      setSseStatus(remoteEither.left(sseExceptionADT.disconnected()));
      if (retryCount === 0) {
        // immediately try again after a disconnect
        registerEventSource();
      } else {
        // otherwise, delay the retry
        apiConnectionAtom.set('disconnected');
        timeout = setTimeout(registerEventSource, 2500);
      }
    };

    const cleanUp = () => {
      sse.current?.removeEventListener('projectAccess', onProjectAccess);
      sse.current?.removeEventListener('error', onError);
      sse.current?.removeEventListener('open', onConnect);
      sse.current?.removeEventListener('close', onDisconnect);
      sse.current?.close();
      sse.current = null;
      if (timeout != null) {
        clearTimeout(timeout);
      }
    };

    registerEventSource();

    return cleanUp;
  }, [onProjectAccessGranted, clientId, apiConnectionAtom]);

  return sseStatus;
};
