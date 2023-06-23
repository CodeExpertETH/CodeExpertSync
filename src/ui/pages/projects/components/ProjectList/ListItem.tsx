import { Alert, Button, List, Typography } from 'antd';
import React from 'react';
import { constNull, remoteData, task, taskEither } from '@code-expert/prelude';
import { Project, ProjectId, projectADT } from '@/domain/Project';
import { SyncException, syncExceptionADT } from '@/domain/SyncState';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { GuardRemoteEitherData } from '@/ui/components/GuardRemoteData';
import { useTimeContext } from '@/ui/contexts/TimeContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { useRemoteData2, useRemoteDataEither } from '@/ui/hooks/useRemoteData';
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
  onOpen(id: ProjectId): taskEither.TaskEither<string, void>;
  onSync(id: ProjectId, force?: ForceSyncDirection): taskEither.TaskEither<SyncException, void>;
  onRemove(id: ProjectId): task.Task<void>;
}

export const ListItem = ({ project, onOpen, onSync, onRemove }: ListItemProps) => {
  const { now } = useTimeContext();

  const [openStateRD, runOpen] = useRemoteDataEither(onOpen);
  const [syncStateRD, runSync] = useRemoteDataEither(onSync);
  const [removalStateRD, runRemove] = useRemoteData2(onRemove);

  // All states combined. Order matters: the first failure gets precedence.
  const actionStates = remoteData.sequenceT(
    viewFromStringException(openStateRD),
    viewFromSyncException({
      forcePush: () => runSync(project.value.projectId, 'push'),
      forcePull: () => runSync(project.value.projectId, 'pull'),
    })(syncStateRD),
  );

  const syncButtonState = fromProject(project, remoteData.isPending(syncStateRD));

  return (
    <StyledListItem>
      <VStack fill gap={'xs'}>
        <HStack justify={'space-between'}>
          <StyledButton
            type={'link'}
            block
            onClick={() => runOpen(project.value.projectId)}
            disabled={remoteData.isPending(openStateRD)}
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
                    disabled: remoteData.isPending(removalStateRD),
                    onClick: () => runRemove(project.value.projectId),
                  },
                ],
              }}
            />
          </HStack>
        </HStack>
        <GuardRemoteEitherData
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
  e: remoteData.RemoteData<string, A>,
) => remoteData.RemoteData<React.ReactElement, A> = remoteData.mapLeft((x) => <>{x}</>);

const viewFromSyncException: (env: {
  forcePush(): void;
  forcePull(): void;
}) => <A>(
  e: remoteData.RemoteData<SyncException, A>,
) => remoteData.RemoteData<React.ReactElement, A> = ({ forcePush, forcePull }) =>
  remoteData.mapLeft(
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
      invalidFilename: (filename) => <>Filename invalid: "{filename}"</>,
      fileSystemCorrupted: ({ path, reason }) => (
        <>
          Problems with the file system: {reason} ({path})
        </>
      ),
      projectDirMissing: () => <>Project directory not found; set it up in settings</>,
    }),
  );
