import React from 'react';
import { either, pipe, task } from '@code-expert/prelude';
import { config } from '@/config';
import { createToken } from './createAPIRequest';

const cleanUpEventListener = (
  sse: React.MutableRefObject<EventSource | null>,
  onProjectAccess: ({ data }: { data: string }) => void,
  onError: (e: Event) => void,
) => {
  sse.current?.removeEventListener('projectAccess', onProjectAccess);
  sse.current?.removeEventListener('error', onError);
  sse.current?.close();
  sse.current = null;
};

export const useProjectAccess = (onProjectAccess: (projectId: string) => void) => {
  const sse = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    const onProjectAccessI = ({ data: projectId }: { data: string }) => {
      console.log('data', projectId);
      onProjectAccess(projectId);
    };

    const onError = (e: Event) => {
      throw e;
    };

    if (sse.current == null) {
      void pipe(
        createToken({}),
        task.map((token) => {
          if (either.isRight(token)) {
            sse.current = new EventSource(
              `${config.CX_API_URL}/app/projectAccess?token=${token.right}`,
            );
            sse.current.addEventListener('projectAccess', onProjectAccessI);
            sse.current.addEventListener('error', onError);
          }
        }),
        task.run,
      );
    }

    return () => {
      cleanUpEventListener(sse, onProjectAccessI, onError);
    };
  }, [onProjectAccess]);
};
