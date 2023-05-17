import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { globalSetupState } from '@/domain/Setup';
import { Setup } from '@/ui/pages/Setup';
import { routes, useGlobalContextWithActions } from './GlobalContext';
import { Developer } from './pages/Developer';
import { Logout } from './pages/Logout';
import { MainWrapper } from './pages/Main';
import { Settings } from './pages/settings/Settings';

function Routes() {
  const [{ currentPage, setupState }, dispatch] = useGlobalContextWithActions();
  useHotkeys('ctrl+c+x', () => {
    dispatch({ currentPage: routes.developer() });
  });

  return globalSetupState.fold(setupState, {
    notSetup: () => <Setup />,
    setup: () =>
      routes.fold(currentPage, {
        settings: () => <Settings />,
        logout: () => <Logout />,
        main: () => <MainWrapper />,
        developer: () => <Developer />,
      }),
  });
}

export default Routes;
