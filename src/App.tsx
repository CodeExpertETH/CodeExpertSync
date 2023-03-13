import { boolean, pipe } from '@code-expert/prelude';
import { Result } from 'antd';
import React from 'react';

import Routes from './ui/Routes';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import useNetworkState from './ui/hooks/useNetwork';
import { AppLayout } from './ui/layout';

function App() {
  const { online } = useNetworkState();

  return (
    <GlobalContextProvider>
      <AppLayout>
        {pipe(
          online,
          boolean.fold(
            () => (
              <Result
                status="warning"
                title="No internet connection."
                subTitle="Code Expert requires an active internet connection to be able to work correctly."
              />
            ),
            () => <Routes />,
          ),
        )}
      </AppLayout>
    </GlobalContextProvider>
  );
}

export default App;
