import React, { useState } from 'react';
import { useGlobalContextWithActions } from './ui/components/GlobalContext';
import { AuthToken } from './domain/identity';

function AuthTokenManager() {
  const [state, setState] = useGlobalContextWithActions();
  const [token, setToken] = useState('');

  async function save() {
    await state.store.set('authToken', token);
    await state.store.save();
    setState({ authToken: token as AuthToken });
  }

  return (
    <div className="container">
      <h1>AuthToken</h1>

      <div className="row">{state.authToken}</div>
      <div className="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setToken(e.currentTarget.value)}
            placeholder="Enter a token..."
          />
          <button type="button" onClick={() => save()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthTokenManager;
