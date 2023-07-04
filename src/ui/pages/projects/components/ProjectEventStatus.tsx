import { Alert } from 'antd';
import React from 'react';
import { constNull, pipe, remoteData } from '@code-expert/prelude';
import { SSEException, sseExceptionADT } from '@/ui/pages/projects/hooks/useProjectEventUpdate';

const ProjectEventStatus = ({
  status,
}: {
  status: remoteData.RemoteEither<SSEException, EventSource>;
}) =>
  pipe(
    status,
    remoteData.fold(
      constNull,
      constNull,
      (e: SSEException) =>
        sseExceptionADT.fold({
          disconnected: () => (
            <Alert message="Lost connection. Trying to reconnect." showIcon type="warning" />
          ),
        })(e),
      constNull,
    ),
  );

export default ProjectEventStatus;
