import React from 'react';
import { Header } from './ui/layout/Header';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import useNetworkState from './ui/hooks/useNetwork';
import { boolean, pipe } from './prelude';
import { Result } from 'antd';
import Routes from './ui/Routes';

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
