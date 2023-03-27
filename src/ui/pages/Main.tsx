import { Button } from 'antd';
import { api } from 'api';
import React, { useState } from 'react';

import { globalAuthState } from '../../domain/AuthState';
import { useGlobalContextWithActions } from '../GlobalContext';

export function Main() {
  const [, dispatchContext] = useGlobalContextWithActions();

  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const appVersion = await api.getVersion();
    const message: string = await api.greet(name);
    const keys = await api.create_keys();
    console.log(keys);
    setGreetMsg(message);
    console.log(appVersion);
  }

  const onButtonClick = () => {
    dispatchContext({ authState: globalAuthState.notAuthorized() });
  };

  return (
    <div>
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
          <Button onClick={onButtonClick}>Go back to authorise Code Expert Desktop</Button>
        </div>
      </div>
      <p>{greetMsg}</p>
    </div>
  );
}
