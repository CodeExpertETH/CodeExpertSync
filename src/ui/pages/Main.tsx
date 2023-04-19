import { iots, option, pipe, task } from '@code-expert/prelude';
import { Button } from 'antd';
import { api } from 'api';
import React from 'react';

import { globalAuthState } from '../../domain/AuthState';
import { ClientId } from '../../domain/ClientId';
import { createSignedAPIRequest } from '../../domain/createAPIRequest';
import { EntityNotFoundException } from '../../domain/exception';
import { useGlobalContextWithActions } from '../GlobalContext';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { useAsync } from '../hooks/useAsync';
import { Projects } from './projects';

export function Main(props: { clientId: ClientId }) {
  const [, dispatchContext] = useGlobalContextWithActions();

  async function test() {
    const b = await pipe(
      createSignedAPIRequest({
        path: 'app/checkAccess',
        method: 'GET',
        payload: {},
        codec: iots.strict({ status: iots.string }),
      }),
      task.run,
    );
    console.log(b);
  }

  const onButtonClick = () => {
    dispatchContext({ authState: globalAuthState.notAuthorized() });
  };

  return (
    <div>
      <div className="row">
        <div>
          <button type="button" onClick={() => test()}>
            Test Auth
          </button>
          <Button onClick={onButtonClick}>Go back to authorise Code Expert Desktop</Button>
        </div>
      </div>
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
