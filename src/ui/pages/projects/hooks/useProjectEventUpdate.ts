import React from 'react';
import { pipe, remoteData, tagged, task, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { createToken } from '@/utils/jwt';

export type SSEException = tagged.Tagged<'disconnected'>;
export const sseExceptionADT = tagged.build<SSEException>();

export const useProjectEventUpdate = (
  onProjectAdded: () => void,
  clientId: ClientId,
): remoteData.RemoteEither<SSEException, EventSource> => {
  const sse = React.useRef<EventSource | null>(null);
  const [sseStatus, setSseStatus] = React.useState<
    remoteData.RemoteEither<SSEException, EventSource>
  >(remoteData.initial);

  const onConnect = React.useCallback(function (this: EventSource) {
    setSseStatus(remoteData.success(this));
  }, []);

  const onDisconnect = React.useCallback(() => {
    setSseStatus(remoteData.initial);
  }, []);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const registerEventSource = () => {
      if (sse.current == null) {
        void pipe(
          createToken(clientId)(),
          taskEither.map((token) => {
            if (sse.current == null) {
              setSseStatus(remoteData.pending);
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
      setSseStatus(remoteData.failure(sseExceptionADT.disconnected()));
    };

    registerEventSource();

    return cleanUp;
  }, [onProjectAdded, clientId, onConnect, onDisconnect]);
  return sseStatus;
};
