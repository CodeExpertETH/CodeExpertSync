import { either, option, pipe, task } from '@code-expert/prelude';
import { Button, Result } from 'antd';
import { api } from 'api';
import React from 'react';

import { listenForAuthTokens } from '../../api/oauth/listenForAuthToken';
import { AppId } from '../../domain/AppId';
import { EntityNotFoundException } from '../../domain/exception';
import { digestMessage, pkceChallenge } from '../../utils/crypto';
import { routes, useGlobalContextWithActions } from '../components/GlobalContext';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { Icon } from '../foundation/Icons';
import { useAsync } from '../hooks/useAsync';

function NotAuthorized() {
  const [, dispatchContext] = useGlobalContextWithActions();
  const { code_verifier, code_challenge } = pkceChallenge();

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

  const onButtonClick = () => {
    void listenForAuthTokens(
      code_verifier,
      either.fold(
        (e) => {
          //todo show error
          console.log(e);
        },
        (accessToken) =>
          dispatchContext({
            accessToken,
            currentPage: routes.main(),
          }),
      ),
    );

    dispatchContext({ currentPage: routes.waitingForAuthorization() });
  };

  return (
    <GuardRemoteData
      value={appIdentifier}
      render={(appIdentifier) => (
        <Result
          title="Code Expert Desktop is not authorized"
          subTitle="To authorize click the button below and authorize the Code Expert Desktop App in Code Expert"
          icon={<Icon name="lock" size="4x" />}
          extra={
            <Button
              type="primary"
              href={`${api.CXUrl}/app/authorize?appIdentifier=${digestMessage(
                appIdentifier,
              )}&code_challenge=${code_challenge}`}
              onClick={onButtonClick}
              target="_blank"
            >
              Authorize Code Expert Desktop
            </Button>
          }
        />
      )}
    />
  );
}

export default NotAuthorized;
