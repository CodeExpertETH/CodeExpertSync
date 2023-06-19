import { Button, Result } from 'antd';
import { api } from 'api';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { globalSetupState, setupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import { routes, useRoute } from '@/ui/routes';

export function Logout({ clientId }: { clientId: ClientId }) {
  const [, dispatch] = useGlobalContextWithActions();
  const { navigateTo } = useRoute();

  const logout = () =>
    pipe(
      api.logout(),
      task.map(() => {
        dispatch({
          setupState: globalSetupState.setup({ state: setupState.notAuthorized() }),
        });
        navigateTo(routes.projects(clientId));
      }),
      task.run,
    );
  return (
    <Result
      title="Logout from Code Expert Desktop"
      subTitle="If you logout from Code Expert Desktop, you cannot sync the projects anymore."
      icon={<Icon name="lock" size="4x" />}
      extra={
        <Button type="primary" danger onClick={logout}>
          Logout Code Expert Desktop
        </Button>
      }
    />
  );
}
