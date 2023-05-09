import { api } from 'api';
import React from 'react';
import { option, pipe, task } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { EntityNotFoundException } from '@/domain/exception';
import { GuardRemoteData } from '@/ui/components/GuardRemoteData';
import { useAsync } from '@/ui/hooks/useAsync';
import { Projects } from './projects';

export function Main(props: { clientId: ClientId }) {
  return (
    <div>
      <div className="row">
        <Projects clientId={props.clientId} />
      </div>
    </div>
  );
}

export function MainWrapper() {
  const clientId = useAsync(
    () =>
      pipe(
        api.settingRead('clientId', ClientId),
        task.map(
          option.getOrThrow(
            () =>
              new EntityNotFoundException(
                {},
                'No client id was found. Please contact the developers.',
              ),
          ),
        ),
        task.run,
      ),
    [],
  );

  return <GuardRemoteData value={clientId} render={(clientId) => <Main clientId={clientId} />} />;
}
