import React from 'react';

import { globalAuthState } from './components/AuthState';
import { routes, useGlobalContext } from './components/GlobalContext';
import Main from './pages/Main';
import NotAuthorized from './pages/NotAuthorized';

function Routes() {
  const { currentPage, authState } = useGlobalContext();

  return globalAuthState.fold(authState, {
    notAuthorized: () => <NotAuthorized />,
    authorized: () =>
      routes.fold(currentPage, {
        settings: () => <span>Settings</span>,
        main: () => <Main />,
      }),
  });
}

export default Routes;
