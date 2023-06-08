import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { globalSetupState } from '@/domain/Setup';
import { Setup } from '@/ui/pages/setup';
import { routes, useGlobalContextWithActions } from './GlobalContext';
import { MainWrapper } from './pages/Main';
import { Developer } from './pages/developer';
import { Logout } from './pages/logout';
import { Settings } from './pages/settings/Settings';

function Routes() {
  const [{ currentPage, setupState }, dispatch] = useGlobalContextWithActions();
  useHotkeys('ctrl+c+x', () => {
    dispatch({ currentPage: routes.developer() });
  });

  return globalSetupState.fold(setupState, {
    setup: ({ state }) => <Setup state={state} />,
    setupDone: () =>
      routes.fold(currentPage, {
        settings: () => <Settings />,
        logout: () => <Logout />,
        main: () => <MainWrapper />,
        developer: () => <Developer />,
      }),
  });
}

export default Routes;
