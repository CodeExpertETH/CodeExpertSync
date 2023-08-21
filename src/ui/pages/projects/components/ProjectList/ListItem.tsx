import { Alert, Button, Collapse, List, Typography } from 'antd';
import React, { useEffect } from 'react';
import { constNull, flow, io, remoteEither, task, taskEither } from '@code-expert/prelude';
import { RemoteFileInfo, invalidFileNameMessage } from '@/domain/FileSystem';
import { Project, ProjectId, projectADT } from '@/domain/Project';
import { SyncException, syncExceptionADT } from '@/domain/SyncException';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { GuardRemoteEither } from '@/ui/components/GuardRemoteData';
import { useTimeContext } from '@/ui/contexts/TimeContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { useTask } from '@/ui/hooks/useTask';
import { fromProject } from '@/ui/pages/projects/components/ProjectList/model/SyncButtonState';
import { ForceSyncDirection } from '@/ui/pages/projects/hooks/useProjectSync';
import { routes, useRoute } from '@/ui/routes';
import { SyncButton } from './SyncButton';

const StyledListItem = styled(List.Item, () => ({
  position: 'relative',
  paddingInline: '0 !important',
  alignItems: 'start !important',
}));

const StyledButton = styled(Button, ({ tokens }) => ({
  whiteSpace: 'normal',
  padding: 0,
  textAlign: 'left',
  height: 'auto',
  paddingBlock: 2,
  '&.ant-btn': {
    color: tokens.colorText,
    '&:hover': {
      color: tokens.colorLink,
    },
    '&:active': {
      color: tokens.colorLinkActive,
    },
    '&:disabled': {
      color: tokens.colorTextDisabled,
      cursor: 'wait',
    },
  },
}));

export interface ListItemProps {
  project: Project;
  onOpen: (id: ProjectId) => taskEither.TaskEither<string, void>;
  onSync: (id: ProjectId, force?: ForceSyncDirection) => taskEither.TaskEither<SyncException, void>;
  onRemove: (id: ProjectId) => task.Task<void>;
  onRevertFile: (id: ProjectId, file: RemoteFileInfo) => taskEither.TaskEither<SyncException, void>;
}

export const ListItem = ({ project, onOpen, onSync, onRemove, onRevertFile }: ListItemProps) => {
  const { now } = useTimeContext();
  const { navigateTo } = useRoute();

  const [openStateRD, runOpen] = useTask(onOpen);
  const [removalStateRD, runRemove] = useTask(onRemove);
  const [syncStateRD, runSync] = useTask(onSync);
  const [revertFileStateRD, runRevert] = useTask(
    flow(
      onRevertFile,
      taskEither.chainFirstIOK(() => () => runSync(project.value.projectId)),
    ),
  );

  const callWhenSynced = useCallWhen(projectADT.is.local(project));

  const onOpenClick = React.useCallback(() => {
    if (projectADT.is.local(project)) {
      runOpen(project.value.projectId);
    } else {
      callWhenSynced(() => runOpen(project.value.projectId));
      runSync(project.value.projectId);
    }
  }, [callWhenSynced, project, runOpen, runSync]);

  const syncEnv: ViewFromSyncExceptionEnv = {
    choseProjectDir: () => navigateTo(routes.settings()),
    forcePush: () => runSync(project.value.projectId, 'push'),
    forcePull: () => runSync(project.value.projectId, 'pull'),
    revertFile: (file) => runRevert(project.value.projectId, file),
  };

  // All states combined. Order matters: the first failure gets precedence.
  const actionStates = remoteEither.sequenceT(
    viewFromStringException(openStateRD),
    viewFromSyncException(syncEnv)(revertFileStateRD),
    viewFromSyncException(syncEnv)(syncStateRD),
  );

  const syncButtonState = fromProject(project, remoteEither.isPending(syncStateRD));

  return (
    <StyledListItem>
      <VStack fill gap={'xs'}>
        <HStack justify={'space-between'}>
          <StyledButton
            type={'link'}
            block
            onClick={onOpenClick}
            disabled={remoteEither.isPending(openStateRD)}
          >
            {project.value.taskName}
          </StyledButton>
          <HStack gap={'xxs'} align={'start'}>
            <SyncButton
              now={now}
              state={syncButtonState}
              onClick={() => runSync(project.value.projectId)}
            />
            <ActionMenu
              label={'Actions'}
              menu={{
                items: [
                  {
                    label: 'Open directory',
                    key: 'open',
                    disabled: projectADT.is.remote(project),
                    icon: <Icon name="folder-open-regular" />,
                    onClick: onOpenClick,
                  },
                  {
                    label: 'Sync to local computer',
                    key: 'sync',
                    icon: <Icon name="sync" />,
                    onClick: () => runSync(project.value.projectId),
                  },
                  { type: 'divider' },
                  {
                    label: 'Remove',
                    key: 'remove',
                    icon: <Icon name="trash" />,
                    danger: true,
                    disabled: remoteEither.isPending(removalStateRD),
                    onClick: () => runRemove(project.value.projectId),
                  },
                ],
              }}
            />
          </HStack>
        </HStack>
        <GuardRemoteEither
          value={actionStates}
          render={constNull}
          pending={constNull}
          failure={(err) => <Alert type={'warning'} description={err} />}
        />
      </VStack>
    </StyledListItem>
  );
};

// -------------------------------------------------------------------------------------------------

const viewFromStringException: <A>(
  e: remoteEither.RemoteEither<string, A>,
) => remoteEither.RemoteEither<React.ReactElement, A> = remoteEither.mapLeft((x) => <>{x}</>);

interface ViewFromSyncExceptionEnv {
  choseProjectDir: () => void;
  forcePush: () => void;
  forcePull: () => void;
  revertFile: (file: RemoteFileInfo) => void;
}

const viewFromSyncException: (
  env: ViewFromSyncExceptionEnv,
) => <A>(
  e: remoteEither.RemoteEither<SyncException, A>,
) => remoteEither.RemoteEither<React.ReactElement, A> = ({
  choseProjectDir,
  forcePush,
  forcePull,
  revertFile,
}) =>
  remoteEither.mapLeft(
    syncExceptionADT.fold({
      conflictingChanges: () => (
        <>
          <Typography.Paragraph>
            There are conflicting changes between your local copy and the remote project. This can
            be resolved by keeping either one of them.
          </Typography.Paragraph>
          <HStack gap="xs" justify="center">
            <Button onClick={forcePush}>Use local copy</Button>
            <Button onClick={forcePull}>Reset from remote</Button>
          </HStack>
        </>
      ),
      fileAddedToReadOnlyDir: (file) => (
        <Typography.Paragraph>
          You added a file to a read-only directory. Please remove it to continue syncing:
          <br />{' '}
          <HStack align="center" gap="xs">
            <Icon name={'file'} />
            <strong>{file.path}</strong>
          </HStack>
        </Typography.Paragraph>
      ),
      readOnlyFileChanged: (file) => (
        <>
          <Typography.Paragraph>
            You changed a read-only file:
            <br />
            <HStack align="center" gap="xs">
              <Icon name={'file'} />
              <strong>{file.path}</strong>
            </HStack>
          </Typography.Paragraph>
          <Typography.Paragraph>
            Save your changes elsewhere and then revert back to the original file.
          </Typography.Paragraph>
          <HStack gap="xs" justify="center">
            <Button onClick={() => revertFile(file)}>Revert changes</Button>
          </HStack>
        </>
      ),
      invalidFilename: (filename) => (
        <>
          <Typography.Paragraph>
            This file name can’t be used, please rename:
            <br />
            <HStack align="center" gap="xs">
              <Icon name={'file'} />
              <strong>{filename}</strong>
            </HStack>
          </Typography.Paragraph>
          <Typography.Paragraph>{invalidFileNameMessage}</Typography.Paragraph>
        </>
      ),
      fileSystemCorrupted: ({ path, reason }) => (
        <>
          Problems with the file system: {reason} ({path})
        </>
      ),
      projectDirMissing: () => (
        <>
          <Typography.Paragraph>
            Could not store the project data, please choose a storage location first.
          </Typography.Paragraph>
          <Button type="primary" onClick={choseProjectDir}>
            Choose project directory …
          </Button>
        </>
      ),
      networkError: ({ reason }) => (
        <>
          <Typography.Paragraph>
            Could not connect to the server. Please make sure that your Internet connection is
            working or try again later.
          </Typography.Paragraph>
          <Collapse
            items={[
              {
                key: 'details',
                children: <Typography.Paragraph>{reason}</Typography.Paragraph>,
                label: 'Show error details',
              },
            ]}
          ></Collapse>
        </>
      ),
    }),
  );

const useCallWhen = (condition: boolean) => {
  const { current } = React.useRef({
    f: undefined as io.IO<void> | undefined,
    setF: (f?: io.IO<void>) => (current.f = f),
  });
  useEffect(() => {
    if (condition) {
      current.f?.();
      current.setF();
    }
  }, [condition, current]);
  return current.setF;
};
