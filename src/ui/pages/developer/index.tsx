import { BaseDirectory } from '@tauri-apps/api/fs';
import { Alert, Button } from 'antd';
import React from 'react';
import { constVoid, flow, iots, pipe, task, taskEither } from '@code-expert/prelude';
import { isoNativePath } from '@/domain/FileSystem';
import { globalSetupState, setupState } from '@/domain/Setup';
import { fs } from '@/lib/tauri';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { VStack } from '@/ui/foundation/Layout';
import { notification, notificationT } from '@/ui/helper/notifications';
import { routes, useRoute } from '@/ui/routes';
import { apiErrorToMessage, apiGetSigned } from '@/utils/api';

export function Developer() {
  const [{ projectRepository }, dispatchContext] = useGlobalContextWithActions();
  const { navigateTo } = useRoute();

  const testAuth = () => {
    pipe(
      apiGetSigned({
        path: 'access/assertAccess',
        codec: iots.strict({ status: iots.string }),
      }),
      taskEither.map(constVoid),
      taskEither.run(flow(apiErrorToMessage, notification.error)),
    );
  };

  const cleanConfig = () =>
    pipe(
      projectRepository.projects.get(),
      task.traverseSeqArray(projectRepository.removeProject),
      task.chainFirst(() =>
        pipe(
          taskEither.sequenceT(
            fs.removeFile(isoNativePath.wrap('settings.json'), { dir: BaseDirectory.AppLocalData }),
            fs.removeFile(isoNativePath.wrap('privateKey.pem'), {
              dir: BaseDirectory.AppLocalData,
            }),
          ),
          taskEither.fold(
            (e) => notificationT.error(e.message),
            () => notificationT.success('Deleted config data'),
          ),
        ),
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
