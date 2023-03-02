import React, { useState } from 'react';
import { api } from 'api';
import { Header } from './ui/layout/Header';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import { AuthTokenManager } from './AuthToken';
import useNetworkState from './ui/hooks/useNetwork';
import { boolean, pipe } from './prelude';
import { Result } from 'antd';

function App() {
  const { online } = useNetworkState();
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const appVersion = await api.getVersion();
    const message: string = await api.greet(name);
    setGreetMsg(message);
    console.log(appVersion);
  }

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
            () => (
              <div className="container">
                <h1>Welcome to Tauri!</h1>

                <AuthTokenManager />

                <div className="row">
                  <div>
                    <input
                      id="greet-input"
                      onChange={(e) => setName(e.currentTarget.value)}
                      placeholder="Enter a name..."
                    />
                    <button type="button" onClick={() => greet()}>
                      Greet
                    </button>
                  </div>
                </div>
                <p>{greetMsg}</p>
              </div>
            ),
          ),
        )}
      </Header>
    </GlobalContextProvider>
  );
}

export default App;
