import { pipe, task, taskEither } from '@code-expert/prelude';
import { api } from 'api';
import React from 'react';

import { ClientId } from '../../../../domain/ClientId';
import { createTokenWithClientId } from '../../../../domain/createAPIRequest';

export const useProjectEventUpdate = (onProjectAdded: () => void, clientId: ClientId): void => {
  const sse = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    const onProjectAdd = () => {
      onProjectAdded();
    };
    const onError = (e: Event) => {
      throw e;
    };

    if (sse.current == null) {
      void pipe(
        createTokenWithClientId({})(clientId),
        taskEither.map((token) => {
          //ensure that due to async nature only added once
          if (sse.current == null) {
            sse.current = new EventSource(`${api.APIUrl}/app/projectAccess?token=${token}`);
            sse.current.addEventListener('projectAccess', onProjectAdd);
            sse.current.addEventListener('error', onError);
          }
        }),
        task.run,
      );
    }

    return () => {
      sse.current?.removeEventListener('projectAccess', onProjectAdd);
      sse.current?.removeEventListener('error', onError);
      sse.current?.close();
      sse.current = null;
    };
  }, [onProjectAdded, clientId]);
};
