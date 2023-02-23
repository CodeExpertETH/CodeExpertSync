import React, { useRef } from 'react';
import { message } from 'antd';
import { useGlobalContextWithActions } from './ui/components/GlobalContext';
import { AuthToken } from './domain/AuthToken';
import { either, pipe } from './prelude';

export const AuthTokenManager = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useGlobalContextWithActions();

  const save = () =>
    pipe(
      ref.current?.value,
      AuthToken.decode,
      either.fold(
        (err) => {
          void message.warning('Invalid token');
          console.error(err);
        },
        (authToken) => setState({ authToken }),
      ),
    );

  return (
    <div className="container">
      <h1>AuthToken</h1>

      <div className="row">{state.authToken}</div>
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
