import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { globalAuthState } from '@/domain/AuthState';
import { routes, useGlobalContextWithActions } from './GlobalContext';
import { Developer } from './pages/Developer';
import { Logout } from './pages/Logout';
import { MainWrapper } from './pages/Main';
import { NotAuthorized } from './pages/NotAuthorized';
import { Settings } from './pages/Settings';

function Routes() {
  const [{ currentPage, authState }, dispatch] = useGlobalContextWithActions();
  useHotkeys('ctrl+c+x', () => {
    dispatch({ currentPage: routes.developer() });
  });

  return globalAuthState.fold(authState, {
    notAuthorized: () => <NotAuthorized />,
    authorized: () =>
      routes.fold(currentPage, {
        settings: () => <Settings />,
        logout: () => <Logout />,
        main: () => <MainWrapper />,
        developer: () => <Developer />,
      }),
  });
}

export default Routes;
