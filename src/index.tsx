import React from 'react';
import { createRoot } from 'react-dom/client';
import { mkProjectRepositoryTauri } from '@/infrastructure/ProjectRepositoryTauri';
import { App } from './App';
import './global.css';
import './reset.css';

const projectRepository = await mkProjectRepositoryTauri()();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Container not found!');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App projectRepository={projectRepository} />
  </React.StrictMode>,
);
