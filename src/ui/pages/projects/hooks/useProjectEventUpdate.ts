import React from 'react';
import { pipe, task, taskEither } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { createTokenWithClientId } from '@/domain/createAPIRequest';

export const useProjectEventUpdate = (onProjectAdded: () => void, clientId: ClientId): void => {
  const sse = React.useRef<EventSource | null>(null);
  const disconnectCount = React.useRef<number>(0);
  console.log(clientId);

  const resetDisconnectCount = React.useCallback(() => {
    disconnectCount.current = 0;
  }, []);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const registerEventSource = () => {
      if (sse.current == null) {
        void pipe(
          createTokenWithClientId({})(clientId),
          taskEither.map((token) => {
            console.log(token);
            if (sse.current == null) {
              sse.current = new EventSource(
                `${config.CX_API_URL}/app/projectAccess?token=${token}`,
              );
              sse.current.addEventListener('projectAccess', onProjectAdd);
              sse.current.addEventListener('error', onError);
              sse.current.addEventListener('open', resetDisconnectCount);
              sse.current.addEventListener('close', resetDisconnectCount);
            }
          }),
          task.run,
        );
      }
    };

    const cleanUp = () => {
      sse.current?.removeEventListener('projectAccess', onProjectAdd);
      sse.current?.removeEventListener('error', onError);
      sse.current?.removeEventListener('open', resetDisconnectCount);
      sse.current?.removeEventListener('close', resetDisconnectCount);
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
      disconnectCount.current += 1;
      cleanUp();
      if (timeout != null) {
        clearTimeout(timeout);
      }
      if (disconnectCount.current > 10) {
        throw new Error('Could not establish connection to server.');
      }
      timeout = setTimeout(registerEventSource, 2500);
    };

    registerEventSource();

    return cleanUp;
  }, [onProjectAdded, clientId, resetDisconnectCount]);
};
