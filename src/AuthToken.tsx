import { either, pipe } from '@code-expert/prelude';
import { message } from 'antd';
import React, { useRef } from 'react';

import { globalAuthState } from './domain/AuthState';
import { AccessToken } from './domain/AuthToken';
import { useGlobalContextWithActions } from './ui/components/GlobalContext';

export const AuthTokenManager = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useGlobalContextWithActions();

  const save = () =>
    pipe(
      ref.current?.value,
      AccessToken.decode,
      either.fold(
        (err) => {
          void message.warning('Invalid token');
          console.error(err);
        },
        (accessToken) => setState({ authState: globalAuthState.authorized({ accessToken }) }),
      ),
    );

  return (
    <div className="container">
      <h1>AuthToken</h1>

      <div className="row">{state.authState._tag}</div>
      <div className="row">
        <div>
          <input ref={ref} id="greet-input" placeholder="Enter a token …" />
          <button type="button" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
