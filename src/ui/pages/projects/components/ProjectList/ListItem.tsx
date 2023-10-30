import { Alert, Button, Collapse, List, Typography } from 'antd';
import React from 'react';
import {
  constNull,
  flow,
  io,
  option,
  pipe,
  remoteEither,
  task,
  taskEither,
} from '@code-expert/prelude';
import {
  RemoteFileInfo,
  invalidFileNameMessage,
  isoNativePath,
  showPfsPath,
} from '@/domain/FileSystem';
import { OpenException, openExceptionADT } from '@/domain/OpenException';
import { LocalProject, Project, ProjectId, projectADT, projectPrism } from '@/domain/Project';
import { SyncException, syncExceptionADT } from '@/domain/SyncException';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { GuardRemoteEither } from '@/ui/components/GuardRemoteData';
import { useTimeContext } from '@/ui/contexts/TimeContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { useCallWhenSome } from '@/ui/hooks/useCallWhenSome';
import { useTask } from '@/ui/hooks/useTask';
import { fromProject } from '@/ui/pages/projects/components/ProjectList/model/SyncButtonState';
import { ForceSyncDirection } from '@/ui/pages/projects/hooks/useProjectSync';
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
  onOpen: (project: LocalProject) => taskEither.TaskEither<OpenException, void>;
  onSync: (
    project: Project,
    force?: ForceSyncDirection,
  ) => taskEither.TaskEither<SyncException, void>;
  onRemove: (project: Project) => task.Task<void>;
  onRevertFile: (id: ProjectId, file: RemoteFileInfo) => taskEither.TaskEither<SyncException, void>;
}

export const ListItem = ({ project, onOpen, onSync, onRemove, onRevertFile }: ListItemProps) => {
  const { now } = useTimeContext();

  const [openStateRD, runOpen] = useTask(onOpen);
  const [removalStateRD, runRemove] = useTask(onRemove);
  const [syncStateRD, runSync] = useTask(onSync);
  const [revertFileStateRD, runRevert] = useTask(
    flow(
      onRevertFile,
      taskEither.chainFirstIOK(() => () => runSync(project)),
    ),
  );

  const callWhenSynced = useCallWhenSome(
    pipe(
      // we need the LocalProject to call runOpen
      projectPrism.local.getOption(project),
      // run the callback after syncStateRD actually fulfills.
      option.chainFirst(() => option.fromPredicate(remoteEither.isRight)(syncStateRD)),
    ),
  );

  const onOpenClick = React.useCallback(() => {
    if (projectADT.is.local(project)) {
      runOpen(project);
    } else {
      callWhenSynced((localProject) => runOpen(localProject));
      runSync(project);
    }
  }, [callWhenSynced, project, runOpen, runSync]);

  const syncEnv: ViewFromSyncExceptionEnv = {
    forcePush: () => runSync(project, 'push'),
    forcePull: () => runSync(project, 'pull'),
    revertFile: (file) => runRevert(project.value.projectId, file),
    resetProject: () => runSync(project, 'pull'),
    tryAgain: () => runSync(project),
  };

  const openEnv: ViewFromOpenExceptionEnv = {
    resetProject: () => {
      callWhenSynced((localProject) => runOpen(localProject));
      runSync(project, 'pull');
    },
    tryAgain: onOpenClick,
  };

  // All states combined. Order matters: the first failure gets precedence.
  const actionStates = remoteEither.sequenceT(
    viewFromOpenException(openEnv)(openStateRD),
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
            <SyncButton now={now} state={syncButtonState} onClick={() => runSync(project)} />
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
                    label: 'Synchronise project',
                    key: 'sync',
                    icon: <Icon name="sync" />,
                    onClick: () => runSync(project),
                  },
                  { type: 'divider' },
                  {
                    label: 'Remove',
                    key: 'remove',
                    icon: <Icon name="trash" />,
                    danger: true,
                    disabled: remoteEither.isPending(removalStateRD),
                    onClick: () => runRemove(project),
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

interface ViewFromOpenExceptionEnv {
  resetProject: io.IO<void>;
  tryAgain: io.IO<void>;
}

const viewFromOpenException: (
  env: ViewFromOpenExceptionEnv,
) => <A>(
  e: remoteEither.RemoteEither<OpenException, A>,
) => remoteEither.RemoteEither<React.ReactElement, A> = (env) =>
  remoteEither.mapLeft(
    openExceptionADT.fold({
      noSuchDirectory: (x) => (
        <>
          <Typography.Paragraph>
            Could not open the project for the following reason:
            <pre>{x.reason}</pre>
            Please make sure the project files are available at the following path and try again:
            <HStack align="baseline" gap="xs">
              <Icon name="folder-regular" />
              <strong>{isoNativePath.unwrap(x.path)}</strong>
            </HStack>
            Or reset the project from remote.
          </Typography.Paragraph>
          <HStack gap="xs" justify="center">
            <Button onClick={env.resetProject}>Reset from remote</Button>
            <Button onClick={env.tryAgain}>Try again</Button>
          </HStack>
        </>
      ),
    }),
  );

interface ViewFromSyncExceptionEnv {
  forcePush: () => void;
  forcePull: () => void;
  revertFile: (file: RemoteFileInfo) => void;
  resetProject: io.IO<void>;
  tryAgain: io.IO<void>;
}

const viewFromSyncException: (
  env: ViewFromSyncExceptionEnv,
) => <A>(
  e: remoteEither.RemoteEither<SyncException, A>,
) => remoteEither.RemoteEither<React.ReactElement, A> = ({
  forcePush,
  forcePull,
  revertFile,
  tryAgain,
  resetProject,
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
            <strong>{showPfsPath.show(file.path)}</strong>
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
              <strong>{showPfsPath.show(file.path)}</strong>
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
          <Typography.Paragraph>
            The app’s file system is broken for this file:
            <br />
            <HStack align="baseline" gap="xs">
              <Icon name={'file'} />
              <strong>{path}</strong>
            </HStack>
          </Typography.Paragraph>
          <Typography.Paragraph>
            With the following reason:
            <pre>{reason}</pre>
          </Typography.Paragraph>
          <Typography.Paragraph>
            Try removing the project directory from your computer or contact support.
          </Typography.Paragraph>
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
      noSuchDirectory: (x: OpenException['value']) => (
        <>
          <Typography.Paragraph>
            Could not sync the project for the following reason:
            <pre>{x.reason}</pre>
            Please make sure the project files are available at the following path and try again:
            <HStack align="baseline" gap="xs">
              <Icon name="folder-regular" />
              <strong>{isoNativePath.unwrap(x.path)}</strong>
            </HStack>
            Or reset the project from remote.
          </Typography.Paragraph>
          <HStack gap="xs" justify="center">
            <Button onClick={resetProject}>Reset from remote</Button>
            <Button onClick={tryAgain}>Try again</Button>
          </HStack>
        </>
      ),
    }),
  );
