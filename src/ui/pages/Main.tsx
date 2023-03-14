import { Button } from 'antd';
import { api } from 'api';
import React, { useState } from 'react';

import { AuthTokenManager } from '../../AuthToken';
import { globalAuthState } from '../components/AuthState';
import { useGlobalContextWithActions } from '../components/GlobalContext';

function Main() {
  const [, dispatchContext] = useGlobalContextWithActions();

  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const appVersion = await api.getVersion();
    const message: string = await api.greet(name);
    setGreetMsg(message);
    console.log(appVersion);
  }

  const onButtonClick = () => {
    dispatchContext({ authState: globalAuthState.notAuthorized() });
  };

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
          <Button onClick={onButtonClick}>Go back to authorize Code Expert Desktop</Button>
        </div>
      </div>
      <p>{greetMsg}</p>
    </div>
  );
}

export default Main;
