import { option, pipe, task } from '@code-expert/prelude';
import { Button, Result } from 'antd';
import { api } from 'api';
import React from 'react';

import { AppId } from '../../domain/AppId';
import { authState, globalAuthState, useAuthState } from '../../domain/AuthState';
import { EntityNotFoundException } from '../../domain/exception';
import { useGlobalContextWithActions } from '../GlobalContext';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { Icon } from '../foundation/Icons';
import { useAsync } from '../hooks/useAsync';

const Comp = ({ appIdentifier }: { appIdentifier: AppId }) => {
  const [, dispatch] = useGlobalContextWithActions();

  const { state, startAuthorization, cancelAuthorization } = useAuthState(
    appIdentifier,
    (accessToken) => {
      dispatch({ authState: globalAuthState.authorized({ accessToken }) });
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
function NotAuthorized() {
  const appIdentifier = useAsync(
    () =>
      pipe(
        api.settingRead('appId', AppId),
        task.map(
          option.getOrThrow(
            () =>
              new EntityNotFoundException(
                {},
                'No app id was found. Please contact the developers.',
              ),
          ),
        ),
        task.run,
      ),
    [],
  );

  return (
    <GuardRemoteData
      value={appIdentifier}
      render={(appIdentifier) => <Comp appIdentifier={appIdentifier} />}
    />
  );
}

export default NotAuthorized;
