import React from 'react';
import { createRoot } from 'react-dom/client';
import { useHotkeys } from 'react-hotkeys-hook';
import { pipe, task } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { globalSetupState } from '@/domain/Setup';
import { mkApiConnectionAtom } from '@/infrastructure/tauri/ApiConnectionRepository';
import { mkProjectRepositoryTauri } from '@/infrastructure/tauri/ProjectRepository';
import { GlobalContextProvider, useGlobalContext } from '@/ui/GlobalContext';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import { TimeContextProvider, timeContext } from '@/ui/contexts/TimeContext';
import { AppLayout } from '@/ui/layout';
import { Courses } from '@/ui/pages/courses';
import { Developer } from '@/ui/pages/developer';
import { Logout } from '@/ui/pages/logout';
import { Projects } from '@/ui/pages/projects';
import { useProjectEventUpdate } from '@/ui/pages/projects/hooks/useProjectEventUpdate';
import { Settings } from '@/ui/pages/settings';
import { Setup } from '@/ui/pages/setup';
import { Updater } from '@/ui/pages/update';
import { RouteContextProvider, routes, useRoute } from '@/ui/routes';

export const render = (container: HTMLElement): Promise<void> =>
  pipe(
    mkProjectRepositoryTauri(),
    task.map((projectRepository) => {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <GlobalContextProvider
              projectRepository={projectRepository}
              apiConnectionAtom={mkApiConnectionAtom()}
            >
              <RouteContextProvider>
                <TimeContextProvider value={timeContext}>
                  <App />
                </TimeContextProvider>
              </RouteContextProvider>
            </GlobalContextProvider>
          </ErrorBoundary>
        </React.StrictMode>,
      );
    }),
    task.toPromise,
  );

function Main({ clientId }: { clientId: ClientId }) {
  const { projectRepository, apiConnectionAtom } = useGlobalContext();
  const { currentRoute } = useRoute();
  useProjectEventUpdate(projectRepository.fetchChanges, clientId, apiConnectionAtom);

  return routes.fold(currentRoute, {
    settings: () => <Settings />,
    logout: () => <Logout />,
    courses: () => <Courses />,
    projects: ({ course }) => <Projects course={course} clientId={clientId} />,
    developer: () => <Developer />,
  });
}

export function App() {
  const { setupState } = useGlobalContext();
  const { navigateTo } = useRoute();

  useHotkeys('ctrl+c+x', () => {
    navigateTo(routes.developer());
  });

  return (
    <AppLayout setup={globalSetupState.is.setup(setupState)}>
      {globalSetupState.fold(setupState, {
        setup: ({ state }) => <Setup state={state} />,
        update: ({ manifest }) => <Updater manifest={manifest} />,
        setupDone: ({ clientId }) => <Main clientId={clientId} />,
      })}
    </AppLayout>
  );
}
