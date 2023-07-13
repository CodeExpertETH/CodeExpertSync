import { Alert } from 'antd';
import React from 'react';
import { constNull, pipe, remoteEither } from '@code-expert/prelude';
import { SSEException, sseExceptionADT } from '@/ui/pages/projects/hooks/useProjectEventUpdate';

const ProjectEventStatus = ({
  status,
}: {
  status: remoteEither.RemoteEither<SSEException, EventSource>;
}) =>
  pipe(
    status,
    remoteEither.match3(
      constNull,
      sseExceptionADT.fold({
        disconnected: () => (
          <Alert message="Lost connection. Trying to reconnect." showIcon type="warning" />
        ),
      }),
      constNull,
    ),
  );

export default ProjectEventStatus;
