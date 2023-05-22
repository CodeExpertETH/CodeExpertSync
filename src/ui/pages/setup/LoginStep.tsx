import { Alert, Button, Typography } from 'antd';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { authState, useAuthState } from '@/domain/AuthState';
import { ClientId } from '@/domain/ClientId';
import { getSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';

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
export const LoginStep = ({ clientId, active }: { clientId: ClientId; active: boolean }) => {
  const [, dispatch] = useGlobalContextWithActions();

  const { state, startAuthorization, cancelAuthorization } = useAuthState(clientId, () => {
    void pipe(
      getSetupState(),
      task.map((state) => dispatch({ setupState: state })),
      task.run,
    );
  });

  return active ? (
    <>
      <Typography.Paragraph>
        You will be redirected to the Code Expert website to confirm that this app is authorised to
        access your projects.
      </Typography.Paragraph>
      {active &&
        authState.fold(state, {
          startingAuthorization: ({ redirectLink, code_verifier }) => (
            <Button
              type="primary"
              href={redirectLink}
              onClick={() => startAuthorization(code_verifier)}
              target="_blank"
            >
              Authorize Code Expert Desktop
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
                Authorize Code Expert Desktop
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
  ) : null;
};
