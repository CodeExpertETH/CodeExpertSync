import { List as AntList, Card, Typography } from 'antd';
import React from 'react';
import { task, taskEither } from '@code-expert/prelude';
import { Project, ProjectId } from '@/domain/Project';
import { SyncException } from '@/domain/SyncState';
import { VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';
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
  onOpen(id: ProjectId): taskEither.TaskEither<string, void>;
  onSync(id: ProjectId): taskEither.TaskEither<SyncException, void>;
  onRemove(id: ProjectId): task.Task<void>;
}

export const List = ({ exerciseName, projects, onOpen, onSync, onRemove }: ListProps) => (
  <VStack gap={'xs'}>
    <Typography.Text strong>{exerciseName}</Typography.Text>
    <StyledCard size="small">
      <AntList
        size="small"
        dataSource={projects}
        renderItem={(project) => (
          <ListItem project={project} onOpen={onOpen} onSync={onSync} onRemove={onRemove} />
        )}
        locale={{
          emptyText: 'No projects',
        }}
      />
    </StyledCard>
  </VStack>
);
