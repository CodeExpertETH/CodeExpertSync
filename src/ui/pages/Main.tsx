import React, { useState } from 'react';
import { api } from 'api';
import { AuthTokenManager } from '../../AuthToken';

function Main() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const appVersion = await api.getVersion();
    const message: string = await api.greet(name);
    setGreetMsg(message);
    console.log(appVersion);
  }

  return (
    <div>
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
  );
}

export default Main;
