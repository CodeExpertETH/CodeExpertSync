import React from 'react';
import { routes, useGlobalContext } from './components/GlobalContext';
import Main from './pages/Main';
import NotAuthorized from './pages/NotAuthorized';

function Routes() {
  const { currentPage } = useGlobalContext();

  return routes.fold(currentPage, {
    notAuthorized: () => <NotAuthorized />,
    main: () => <Main />,
  });
}

export default Routes;
