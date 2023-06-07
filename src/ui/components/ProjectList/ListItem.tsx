import { Alert, Button, List } from 'antd';
import React from 'react';
import { constNull, remoteData, taskEither } from '@code-expert/prelude';
import { Project, ProjectId } from '@/domain/Project';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { GuardRemoteEitherData } from '@/ui/components/GuardRemoteData';
import { fromProject } from '@/ui/components/ProjectList/model/SyncButtonState';
import { useTimeContext } from '@/ui/contexts/TimeContext';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { useRemoteDataEither } from '@/ui/hooks/useRemoteData';
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
  onSync(id: ProjectId): taskEither.TaskEither<string, void>;
}

export const ListItem = ({ project, onOpen, onSync }: ListItemProps) => {
  const { now } = useTimeContext();

  const [openStateRD, runOpen] = useRemoteDataEither(onOpen);
  const [syncStateRD, runSync] = useRemoteDataEither(onSync);

  // All states combined. Order matters: the first failure gets precedence.
  const actionStates = remoteData.sequenceT(openStateRD, syncStateRD);

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
            <ActionMenu label={'Actions'} menu={{ items: [] }} />
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
