import { List as AntList, Card, Typography } from 'antd';
import React from 'react';
import { array, pipe, task, taskEither } from '@code-expert/prelude';
import { RemoteFileInfo } from '@/domain/FileSystem';
import { LocalProject, Project, ProjectId, ordProjectTask } from '@/domain/Project';
import { ShellException } from '@/domain/ShellException';
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
  onOpen: (project: LocalProject) => taskEither.TaskEither<ShellException, void>;
  onSync: (
    project: Project,
    force?: ForceSyncDirection,
  ) => taskEither.TaskEither<SyncException, void>;
  onRemove: (project: Project) => task.Task<void>;
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
