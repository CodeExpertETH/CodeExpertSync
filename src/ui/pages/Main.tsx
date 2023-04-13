import { iots, pipe, task } from '@code-expert/prelude';
import { Button } from 'antd';
import { api } from 'api';
import React, { useState } from 'react';

import { globalAuthState } from '../../domain/AuthState';
import { ProjectMetadata } from '../../domain/Project';
import { createSignedAPIRequest } from '../../domain/createAPIRequest';
import { useGlobalContextWithActions } from '../GlobalContext';

export function Main() {
  const [, dispatchContext] = useGlobalContextWithActions();

  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    const message: string = await api.greet(name);
    setGreetMsg(message);
  }

  async function test() {
    const b = await pipe(
      createSignedAPIRequest({
        path: 'app/checkAccess',
        method: 'GET',
        payload: {},
        codec: iots.strict({ status: iots.string }),
      }),
      task.run,
    );
    console.log(b);
  }

  async function getProjects() {
    const b = await pipe(
      createSignedAPIRequest({
        path: 'project/metadata',
        method: 'GET',
        payload: {},
        codec: iots.array(ProjectMetadata),
      }),
      task.run,
    );
    console.log(b);
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
          <button type="button" onClick={() => test()}>
            Test
          </button>
          <button type="button" onClick={() => getProjects()}>
            get projects
          </button>
          <Button onClick={onButtonClick}>Go back to authorise Code Expert Desktop</Button>
        </div>
      </div>
      <p>{greetMsg}</p>
    </div>
  );
}
