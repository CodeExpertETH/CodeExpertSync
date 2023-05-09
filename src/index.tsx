import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';
import './reset.css';
import './startup/registerApp.ts';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Container not found!');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
