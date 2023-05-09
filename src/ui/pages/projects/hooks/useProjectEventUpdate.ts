import { api } from 'api';
import React from 'react';
import { pipe, task, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { createTokenWithClientId } from '@/domain/createAPIRequest';

export const useProjectEventUpdate = (onProjectAdded: () => void, clientId: ClientId): void => {
  const sse = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    const registerEventSource = () => {
      if (sse.current == null) {
        void pipe(
          createTokenWithClientId({})(clientId),
          taskEither.map((token) => {
            if (sse.current == null) {
              sse.current = new EventSource(`${api.APIUrl}/app/projectAccess?token=${token}`);
              sse.current.addEventListener('projectAccess', onProjectAdd);
              sse.current.addEventListener('error', onError);
            }
          }),
          task.run,
        );
      }
    };

    const cleanUp = () => {
      sse.current?.removeEventListener('projectAccess', onProjectAdd);
      sse.current?.removeEventListener('error', onError);
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
    };

    registerEventSource();

    return cleanUp;
  }, [onProjectAdded, clientId]);
};
