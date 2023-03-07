import { Result } from 'antd';
import React from 'react';

import { boolean, pipe } from './prelude';
import Routes from './ui/Routes';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import useNetworkState from './ui/hooks/useNetwork';
import { Header } from './ui/layout/Header';

function App() {
  const { online } = useNetworkState();

  return (
    <GlobalContextProvider>
      <Header>
        {pipe(
          online,
          boolean.fold(
            () => (
              <Result
                status="warning"
                title="No internet connection."
                subTitle="Code Expert requires a active internet connection to be able to work correct."
              />
            ),
            () => <Routes />,
          ),
        )}
      </Header>
    </GlobalContextProvider>
  );
}

export default App;
