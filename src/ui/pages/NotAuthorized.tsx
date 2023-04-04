import { option, pipe, task } from '@code-expert/prelude';
import { Button, Result } from 'antd';
import { api } from 'api';
import React from 'react';

import { authState, globalAuthState, useAuthState } from '../../domain/AuthState';
import { ClientId } from '../../domain/ClientId';
import { EntityNotFoundException } from '../../domain/exception';
import { useGlobalContextWithActions } from '../GlobalContext';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { Icon } from '../foundation/Icons';
import { useAsync } from '../hooks/useAsync';

const Comp = ({ clientId }: { clientId: ClientId }) => {
  const [, dispatch] = useGlobalContextWithActions();

  const { state, startAuthorization, cancelAuthorization } = useAuthState(
    clientId,
    (privateKey) => {
      void task.run(api.writeConfigFile('privateKey.pem', privateKey));
      dispatch({ authState: globalAuthState.authorized() });
    },
  );

  return authState.fold(state, {
    startingAuthorization: ({ redirectLink, code_verifier }) => (
      <Result
        title="Code Expert Desktop is not authorized"
        subTitle="To authorize click the button below and authorize the Code Expert Desktop App in Code Expert"
        icon={<Icon name="lock" size="4x" />}
        extra={
          <Button
            type="primary"
            href={redirectLink}
            onClick={() => startAuthorization(code_verifier)}
            target="_blank"
          >
            Authorize Code Expert Desktop
          </Button>
        }
      />
    ),
    deniedAuthorization: () => (
      <Result
        title="The access for this app was denied in Code Expert"
        subTitle="To gain access you need to authorize the app in Code Expert."
        icon={<Icon name="user-lock" size="4x" />}
        extra={<Button onClick={cancelAuthorization}>Authorize app again</Button>}
      />
    ),
    timeoutAuthorization: () => (
      <Result
        title="Timeout of authorization request"
        subTitle="To gain access you need to authorize the app in Code Expert."
        icon={<Icon name="clock-solid" size="4x" />}
        extra={<Button onClick={cancelAuthorization}>Authorize app again</Button>}
      />
    ),
    waitingForAuthorization: () => (
      <Result
        title="Code Expert Desktop is waiting for authorization"
        subTitle="Please authorize Code Expert Desktop in Code Expert"
        icon={<Icon name="clock-regular" size="4x" />}
        extra={<Button onClick={cancelAuthorization}>Cancel authorize request</Button>}
      />
    ),
  });
};
export function NotAuthorized() {
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

  return <GuardRemoteData value={clientId} render={(clientId) => <Comp clientId={clientId} />} />;
}
