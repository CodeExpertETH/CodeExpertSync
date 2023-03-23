import React from 'react';

import { globalAuthState } from '../domain/AuthState';
import { routes, useGlobalContext } from './GlobalContext';
import { Logout } from './pages/Logout';
import { Main } from './pages/Main';
import { NotAuthorized } from './pages/NotAuthorized';
import { Settings } from './pages/Settings';

function Routes() {
  const { currentPage, authState } = useGlobalContext();

  return globalAuthState.fold(authState, {
    notAuthorized: () => <NotAuthorized />,
    authorized: () =>
      routes.fold(currentPage, {
        settings: () => <Settings />,
        logout: () => <Logout />,
        main: () => <Main />,
      }),
  });
}

export default Routes;
