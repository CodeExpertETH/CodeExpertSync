import { List as AntList, Card, Typography } from 'antd';
import React from 'react';
import { array, pipe, task, taskEither } from '@code-expert/prelude';
import { RemoteFileInfo } from '@/domain/FileSystem';
import { Project, ProjectId, ordProjectTask } from '@/domain/Project';
import { SyncException } from '@/domain/SyncException';
import { VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
import { ForceSyncDirection } from '@/ui/pages/projects/hooks/useProjectSync';
import { ListItem } from './ListItem';

const StyledCard = styled(Card, ({ tokens }) => ({
  marginInline: -tokens.sizeXXS,
  '.ant-card-body': {
    paddingBlock: 0,
  },
}));

export interface ListProps {
  exerciseName: string;
  projects: Array<Project>;
  onOpen: (id: ProjectId) => taskEither.TaskEither<string, void>;
  onSync: (id: ProjectId, force?: ForceSyncDirection) => taskEither.TaskEither<SyncException, void>;
  onRemove: (id: ProjectId) => task.Task<void>;
  onRevertFile: (id: ProjectId, file: RemoteFileInfo) => taskEither.TaskEither<SyncException, void>;
}

export const List = ({ exerciseName, projects, ...itemEnv }: ListProps) => (
  <VStack gap={'xs'}>
    <Typography.Text strong>{exerciseName}</Typography.Text>
    <StyledCard size="small">
      <AntList
        size="small"
        dataSource={pipe(projects, array.sort(ordProjectTask))}
        renderItem={(project) => <ListItem {...itemEnv} project={project} />}
        locale={{
          emptyText: 'No projects',
        }}
      />
    </StyledCard>
  </VStack>
);
