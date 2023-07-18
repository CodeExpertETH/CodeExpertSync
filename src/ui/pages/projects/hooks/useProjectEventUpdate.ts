import React from 'react';
import { pipe, remoteEither, tagged, task, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { panic } from '@/utils/error';
import { createToken } from '@/utils/jwt';

export type SSEException = tagged.Tagged<'disconnected'>;
export const sseExceptionADT = tagged.build<SSEException>();

export const useProjectEventUpdate = (
  onProjectAdded: () => void,
  clientId: ClientId,
): remoteEither.RemoteEither<SSEException, EventSource> => {
  const sse = React.useRef<EventSource | null>(null);
  // TODO: this doesn't need to be more than a Option<SseException>. Separate this hook into useEventSource(...): RemoteEither<SSEException, EventSource> and useEventListener(eventSource, 'projectAcces', onProjectAdded)
  const [sseStatus, setSseStatus] = React.useState<
    remoteEither.RemoteEither<SSEException, EventSource>
  >(remoteEither.initial);

  const onConnect = React.useCallback(function (this: EventSource) {
    setSseStatus(remoteEither.right(this));
  }, []);

  const onDisconnect = React.useCallback(() => {
    setSseStatus(remoteEither.initial);
  }, []);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const registerEventSource = () => {
      if (sse.current == null) {
        pipe(
          createToken(clientId)(),
          taskEither.getOrElse(panic),
          task.map((token) => {
            if (sse.current == null) {
              setSseStatus(remoteEither.pending);
              sse.current = new EventSource(
                `${config.CX_API_URL}/app/projectAccess?token=${token}`,
              );
              sse.current.addEventListener('projectAccess', onProjectAdd);
              sse.current.addEventListener('error', onError);
              sse.current.addEventListener('open', onConnect);
              sse.current.addEventListener('close', onDisconnect);
            }
          }),
          task.run,
        );
      }
    };

    const cleanUp = () => {
      sse.current?.removeEventListener('projectAccess', onProjectAdd);
      sse.current?.removeEventListener('error', onError);
      sse.current?.removeEventListener('open', onConnect);
      sse.current?.removeEventListener('close', onDisconnect);
      sse.current?.close();
      sse.current = null;
      if (timeout != null) {
        clearTimeout(timeout);
      }
    };
    const onProjectAdd = () => {
      onProjectAdded();
    };
    const onError = (_e: Event) => {
      cleanUp();
      if (timeout != null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(registerEventSource, 2500);
      setSseStatus(remoteEither.left(sseExceptionADT.disconnected()));
    };

    registerEventSource();

    return cleanUp;
  }, [onProjectAdded, clientId, onConnect, onDisconnect]);
  return sseStatus;
};
