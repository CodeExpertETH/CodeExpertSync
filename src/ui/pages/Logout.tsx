import { Button, Result } from 'antd';
import { api } from 'api';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { globalSetupState, setupState } from '@/domain/Setup';
import { routes, useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';

export function Logout() {
  const [, dispatch] = useGlobalContextWithActions();

  const logout = () =>
    pipe(
      api.logout(),
      task.map(() => {
        dispatch({
          setupState: globalSetupState.setup({ state: setupState.notAuthorized() }),
          currentPage: routes.main(),
        });
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
