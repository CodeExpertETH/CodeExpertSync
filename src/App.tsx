import React, { useState } from 'react';
import reactLogo from './assets/react.svg';
import { Store } from 'tauri-plugin-store-api';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';
import { listen } from '@tauri-apps/api/event';
import { getVersion } from '@tauri-apps/api/app';

const store = new Store('.settings.dat');

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');
  const [messagePast, setMessagePast] = useState('');

  void listen('scheme-request-received', (event) => {
    console.log(event);
    // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
    // event.payload is the payload object
  });

  async function greet() {
      const appVersion = await getVersion();

      console.log(appVersion);

      // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const message: string = await invoke('greet', { name });
    setGreetMsg(message);
    await store.set('greet', { message });
    await store.save();
  }

  void store
    .get<{ message: string }>('greet')
    .then((val) => setMessagePast(val ? val.message : ''));

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noreferrer">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">A message from the past: {messagePast}</div>
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

export default App;
