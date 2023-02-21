import React, { useState } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { Header } from './ui/layout/Header';
import { GlobalContextProvider } from './ui/components/GlobalContext';
import AuthTokenManager from './AuthToken';
import { invoke } from '@tauri-apps/api';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const appVersion = await getVersion();
    const message: string = await invoke('greet', { name });
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
