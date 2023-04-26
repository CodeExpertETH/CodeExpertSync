import { iots, pipe, task, taskEither, taskOption } from '@code-expert/prelude';
import { BaseDirectory, removeFile } from '@tauri-apps/api/fs';
import { Alert, Button } from 'antd';
import { api } from 'api';
import React from 'react';

import { globalAuthState } from '../../domain/AuthState';
import { ProjectMetadata } from '../../domain/Project';
import { createSignedAPIRequest } from '../../domain/createAPIRequest';
import { Exception, fromError } from '../../domain/exception';
import { routes, useGlobalContextWithActions } from '../GlobalContext';
import { VStack } from '../foundation/Layout';
import { notification } from '../helper/notifications';
import { deleteLocalProject } from './projects/hooks/useProjectRemove';

export function Developer() {
  const [, dispatchContext] = useGlobalContextWithActions();

  const testAuth = () => {
    void pipe(
      createSignedAPIRequest({
        path: 'app/checkAccess',
        method: 'GET',
        payload: {},
        codec: iots.strict({ status: iots.string }),
      }),
      taskEither.fold(
        (e) => {
          notification.error(`${e.message} : You are not authorized`);
          return task.of(undefined);
        },
        (d) => {
          notification.success(d.status);
          return task.of(undefined);
        },
      ),
      task.run,
    );
  };

  const cleanConfig = () => {
    void pipe(
      api.settingRead('projects', iots.array(ProjectMetadata)),
      taskOption.fold(
        () => taskEither.right<Exception, unknown>(undefined),
        (projects) =>
          pipe(
            projects,
            taskEither.traverseSeqArray((project) =>
              pipe(
                deleteLocalProject(project.projectId),
                taskEither.chain(() =>
                  taskEither.tryCatch(
                    () =>
                      //ignore errors
                      removeFile(`project_${project.projectId}.json`, {
                        dir: BaseDirectory.AppLocalData,
                      }).catch(() => undefined),
                    fromError,
                  ),
                ),
              ),
            ),
          ),
      ),
      taskEither.alt(() => taskEither.right<Exception, unknown>(undefined)),
      taskEither.chain(() =>
        taskEither.tryCatch(async () => {
          //ignore errors
          await removeFile('settings.json', {
            dir: BaseDirectory.AppLocalData,
          }).catch(() => undefined);
          //ignore errors
          await removeFile('privateKey.pem', {
            dir: BaseDirectory.AppLocalData,
          }).catch(() => undefined);
        }, fromError),
      ),
      taskEither.fold(
        (e) => {
          notification.error(`${e.message} : You are not authorized`);
          return task.of(undefined);
        },
        () => {
          notification.success('deleted config data');
          return task.of(undefined);
        },
      ),
      task.map(() => {
        dispatchContext({ authState: globalAuthState.notAuthorized(), currentPage: routes.main() });
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
          dispatchContext({ currentPage: routes.main() });
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
