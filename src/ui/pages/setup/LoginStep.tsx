import { Alert, Button, Typography } from 'antd';
import { api } from 'api';
import React from 'react';
import { flow, pipe, task, taskEither } from '@code-expert/prelude';
import { getNewClientIdFromApi } from '@/application/registerApp';
import { authState, getRedirectLink, useAuthState } from '@/domain/AuthState';
import { getSetupState } from '@/domain/Setup';
import { openWebBrowser } from '@/lib/tauri/shell';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { panic } from '@/utils/error';

const AuthWarning = ({
  warning,
  cancelAuthorization,
}: {
  warning: string;
  cancelAuthorization: () => void;
}) => (
  <Alert
    message={
      <Typography.Text>
        {warning}, please{' '}
        <Button type="link" onClick={cancelAuthorization} style={{ padding: 0 }}>
          try again
        </Button>
        .
      </Typography.Text>
    }
    type="warning"
    showIcon
  />
);

const openInBrowser = flow(
  openWebBrowser,
  taskEither.getOrElse((e) => panic(`Failed to open Code Expert Login in browser: ${e.message}`)),
);

export const LoginStep = () => {
  const [{ projectRepository }, dispatch] = useGlobalContextWithActions();

  const { state, startAuthorization, cancelAuthorization } = useAuthState((clientId) =>
    pipe(
      api.settingWrite('login', 'done'),
      task.chain(() => api.settingWrite('clientId', clientId)),
      task.chain(() => getSetupState(projectRepository)),
      task.map((state) => dispatch({ setupState: state })),
      task.run,
    ),
  );

  return (
    <>
      <Typography.Paragraph>
        You will be redirected to the Code Expert website to confirm that this app is authorised to
        access your projects.
      </Typography.Paragraph>
      {authState.fold(state, {
        startingAuthorization: ({ codeChallenge, codeVerifier }) => (
          <Button
            type="primary"
            onClick={pipe(
              getNewClientIdFromApi,
              task.chainFirstIOK((clientId) => () => startAuthorization(clientId, codeVerifier)),
              task.chainIOK((clientId) => openInBrowser(getRedirectLink(clientId, codeChallenge))),
            )}
            target="_blank"
          >
            Authorize Code Expert Sync
          </Button>
        ),
        deniedAuthorization: () => (
          <AuthWarning warning="Denied authorization" cancelAuthorization={cancelAuthorization} />
        ),
        timeoutAuthorization: () => (
          <AuthWarning warning="Timed out" cancelAuthorization={cancelAuthorization} />
        ),
        waitingForAuthorization: () => (
          <>
            <Button type="primary" loading target="_blank">
              Authorize Code Expert Sync
            </Button>
            <Typography.Paragraph>
              Waiting for confirmation …{' '}
              <Button danger type="link" onClick={cancelAuthorization}>
                Cancel
              </Button>
            </Typography.Paragraph>
          </>
        ),
      })}
    </>
  );
};
