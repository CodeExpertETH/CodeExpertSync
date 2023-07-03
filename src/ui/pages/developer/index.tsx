import { BaseDirectory } from '@tauri-apps/api/fs';
import { Alert, Button } from 'antd';
import React from 'react';
import { iots, pipe, readonlyArray, task, taskOption } from '@code-expert/prelude';
import { Project } from '@/domain/Project';
import { globalSetupState, setupState } from '@/domain/Setup';
import { fs } from '@/lib/tauri';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { VStack } from '@/ui/foundation/Layout';
import { notificationT } from '@/ui/helper/notifications';
import { routes, useRoute } from '@/ui/routes';
import { apiGetSigned } from '@/utils/api';

export function Developer() {
  const [{ projectRepository }, dispatchContext] = useGlobalContextWithActions();
  const { navigateTo } = useRoute();

  const testAuth = () => {
    void pipe(
      apiGetSigned({
        path: 'app/assertAccess',
        codec: iots.strict({ status: iots.string }),
      }),
      task.run,
    );
  };

  const cleanConfig = () => {
    void pipe(
      projectRepository.projects.get(),
      taskOption.fromPredicate(readonlyArray.isNonEmpty),
      taskOption.chainFirstTaskK(
        task.traverseSeqArray((project) =>
          projectRepository.removeProject(project.value.projectId),
        ),
      ),
      taskOption.alt(() => taskOption.some(readonlyArray.zero<Project>())),
      taskOption.chainFirst(() =>
        taskOption.sequenceT(
          fs.removeFile('settings.json', { dir: BaseDirectory.AppLocalData }),
          fs.removeFile('privateKey.pem', { dir: BaseDirectory.AppLocalData }),
        ),
      ),
      taskOption.fold(
        () => notificationT.error('You are not authorized'),
        () => notificationT.success('Deleted config data'),
      ),
      task.map(() => {
        dispatchContext({
          setupState: globalSetupState.setup({ state: setupState.notAuthorized() }),
        });
        navigateTo(routes.courses());
        return undefined;
      }),
      task.run,
    );
  };

  return (
    <VStack gap={8}>
      <Alert
        type="error"
        message={<>This page is for developers only. Any actions here can destroy your data.</>}
      />
      <Button
        onClick={() => {
          navigateTo(routes.courses());
        }}
        block
      >
        Close developer view
      </Button>

      <Button onClick={testAuth} block>
        Test auth
      </Button>
      <Button onClick={cleanConfig} block danger>
        Clean all settings
      </Button>
    </VStack>
  );
}
