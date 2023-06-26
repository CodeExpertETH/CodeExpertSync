import { Result } from 'antd';
import React, { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { boolean, constVoid, pipe, remoteData } from '@code-expert/prelude';
import { registerApp } from '@/application/registerApp';
import { globalSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import useNetworkState from '@/ui/hooks/useNetwork';
import { useRemoteData2 } from '@/ui/hooks/useRemoteData';
import { AppLayout } from '@/ui/layout';
import { Courses } from '@/ui/pages/courses';
import { Developer } from '@/ui/pages/developer';
import { Logout } from '@/ui/pages/logout';
import { Projects } from '@/ui/pages/projects';
import { Settings } from '@/ui/pages/settings';
import { Setup } from '@/ui/pages/setup';
import { Updater } from '@/ui/pages/update';
import { routes, useRoute } from '@/ui/routes';

export function App() {
  const { online } = useNetworkState();
  const [{ setupState }] = useGlobalContextWithActions();
  const { currentRoute, navigateTo } = useRoute();
  const [clientIdRD, refreshClientId] = useRemoteData2(registerApp);

  useHotkeys('ctrl+c+x', () => {
    if (remoteData.isSuccess(clientIdRD)) {
      navigateTo(routes.developer(clientIdRD.value));
    }
  });

  // Startup
  useEffect(() => {
    pipe(
      clientIdRD,
      remoteData.fold3(constVoid, constVoid, (clientId) => {
        if (routes.is.startup(currentRoute)) navigateTo(routes.courses(clientId));
      }),
    );
  }, [clientIdRD, currentRoute, navigateTo]);

  useEffect(() => {
    refreshClientId();
  }, [refreshClientId]);

  return pipe(
    online,
    boolean.fold(
      () => (
        <Result
          status="warning"
          title="No internet connection."
          subTitle="Code Expert requires an active internet connection to be able to work correctly."
        />
      ),
      () =>
        globalSetupState.fold(setupState, {
          setup: ({ state }) => <Setup state={state} />,
          update: ({ manifest }) => <Updater manifest={manifest} />,
          setupDone: () =>
            routes.fold(currentRoute, {
              startup: () => <div>Starting …</div>,
              settings: (clientId) => (
                <AppLayout clientId={clientId}>
                  <Settings clientId={clientId} />
                </AppLayout>
              ),
              logout: (clientId) => (
                <AppLayout clientId={clientId}>
                  <Logout clientId={clientId} />
                </AppLayout>
              ),
              courses: (clientId) => (
                <AppLayout clientId={clientId}>
                  <Courses clientId={clientId} />
                </AppLayout>
              ),
              projects: ({ clientId, course }) => (
                <AppLayout clientId={clientId}>
                  <Projects clientId={clientId} course={course} />
                </AppLayout>
              ),
              developer: (clientId) => (
                <AppLayout clientId={clientId}>
                  <Developer clientId={clientId} />
                </AppLayout>
              ),
            }),
        }),
    ),
  );
}
