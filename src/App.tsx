import React, { useState } from 'react';
import { api } from 'api';
import { Header } from './ui/layout/Header';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import { AuthTokenManager } from './AuthToken';

function App() {
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
      </Header>
    </GlobalContextProvider>
  );
}

export default App;
