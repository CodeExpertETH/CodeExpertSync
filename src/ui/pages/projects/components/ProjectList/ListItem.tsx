import { Alert, Button, List, Typography } from 'antd';
import React from 'react';
import { constNull, remoteEither, task, taskEither } from '@code-expert/prelude';
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
  onOpen(id: ProjectId): taskEither.TaskEither<string, void>;
  onSync(id: ProjectId, force?: ForceSyncDirection): taskEither.TaskEither<SyncException, void>;
  onRemove(id: ProjectId): task.Task<void>;
}

export const ListItem = ({ project, onOpen, onSync, onRemove }: ListItemProps) => {
  const { now } = useTimeContext();
  const { navigateTo } = useRoute();

  const [openStateRD, runOpen] = useTask(onOpen);
  const [syncStateRD, runSync] = useTask(onSync);
  const [removalStateRD, runRemove] = useTask(onRemove);

  // All states combined. Order matters: the first failure gets precedence.
  const actionStates = remoteEither.sequenceT(
    viewFromStringException(openStateRD),
    viewFromSyncException({
      choseProjectDir: () => navigateTo(routes.settings()),
      forcePush: () => runSync(project.value.projectId, 'push'),
      forcePull: () => runSync(project.value.projectId, 'pull'),
    })(syncStateRD),
  );

  const syncButtonState = fromProject(project, remoteEither.isPending(syncStateRD));

  return (
    <StyledListItem>
      <VStack fill gap={'xs'}>
        <HStack justify={'space-between'}>
          <StyledButton
            type={'link'}
            block
            onClick={() => runOpen(project.value.projectId)}
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
                    onClick: () => runOpen(project.value.projectId),
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

const viewFromSyncException: (env: {
  choseProjectDir(): void;
  forcePush(): void;
  forcePull(): void;
}) => <A>(
  e: remoteEither.RemoteEither<SyncException, A>,
) => remoteEither.RemoteEither<React.ReactElement, A> = ({
  choseProjectDir,
  forcePush,
  forcePull,
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
      readOnlyFilesChanged: ({ path, reason }) => (
        <>
          Read-only files changed: {reason} ({path})
        </>
      ),
      invalidFilename: (filename) => <>Filename invalid: &quot;{filename}&quot;</>,
      fileSystemCorrupted: ({ path, reason }) => (
        <>
          Problems with the file system: {reason} ({path})
        </>
      ),
      projectDirMissing: () => (
        <>
          <Typography.Paragraph>
            Could not find the project directory to store data in.
          </Typography.Paragraph>
          <Button onClick={choseProjectDir}>Chose project directory …</Button>
        </>
      ),
      networkError: ({ reason }) => <>Network error: {reason}</>,
    }),
  );
