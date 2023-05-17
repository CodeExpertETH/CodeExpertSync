import { Result } from 'antd';
import React, { useEffect } from 'react';
import { boolean, pipe } from '@code-expert/prelude';
import { registerApp } from '@/startup/registerApp';
import { GlobalContextProvider } from '@/ui/GlobalContext';
import Routes from '@/ui/Routes';
import useNetworkState from '@/ui/hooks/useNetwork';
import { AppLayout } from '@/ui/layout';

function App() {
  const { online } = useNetworkState();

  useEffect(() => {
    void registerApp();
  }, []);

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
