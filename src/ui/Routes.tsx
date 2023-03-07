import React from 'react';

import { routes, useGlobalContext } from './components/GlobalContext';
import Main from './pages/Main';
import NotAuthorized from './pages/NotAuthorized';
import WaitingForAuthorization from './pages/WaitingForAuthorization';

function Routes() {
  const { currentPage } = useGlobalContext();

  return routes.fold(currentPage, {
    notAuthorized: () => <NotAuthorized />,
    waitingForAuthorization: () => <WaitingForAuthorization />,
    main: () => <Main />,
  });
}

export default Routes;
