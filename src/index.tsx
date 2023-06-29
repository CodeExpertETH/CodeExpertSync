import React from 'react';
import { createRoot } from 'react-dom/client';
import { mkProjectRepositoryTauri } from '@/infrastructure/tauri/ProjectRepository';
import { GlobalContextProvider } from '@/ui/GlobalContext';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { TimeContextProvider, timeContext } from '@/ui/contexts/TimeContext';
import { RouteContextProvider } from '@/ui/routes';
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
    <ErrorBoundary>
      <GlobalContextProvider projectRepository={projectRepository}>
        <RouteContextProvider>
          <TimeContextProvider value={timeContext}>
            <App />
          </TimeContextProvider>
        </RouteContextProvider>
      </GlobalContextProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
