import { Card, List, Typography } from 'antd';
import React from 'react';
import { ActionButton } from '@/ui/components/ActionButton';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';

const StyledCard = styled(Card, ({ tokens }) => ({
  marginInline: -tokens.sizeXXS,
  '.ant-card-body': {
    paddingBlock: 0,
  },
}));

const StyledListItem = styled(List.Item, () => ({
  position: 'relative',
  paddingInline: '0 !important',
}));

const StyledLink = styled(Typography.Link, ({ tokens }) => ({
  '&.ant-typography': {
    color: tokens.colorText,
    '&:hover': {
      color: tokens.colorLink,
    },
    '&:active': {
      color: tokens.colorLinkActive,
    },
  },
  '&::after': {
    content: '""',
    display: 'block',
    position: 'absolute',
    inset: 0,
  },
}));

export interface Task {
  name: string;
}

export interface TaskListProps {
  exerciseName: string;
  tasks: NonEmptyArray<Task>; // FIXME Pass in Array<ReactNode> here and extract a TaskItem component
}

export const TaskList = ({ exerciseName, tasks }: TaskListProps) => (
  <VStack gap={'xs'}>
    <Typography.Text strong>{exerciseName}</Typography.Text>
    <StyledCard size="small">
      <List
        size="small"
        dataSource={tasks}
        renderItem={(task) => (
          <StyledListItem
            extra={
              <HStack gap={'xxs'}>
                <ActionButton label="Sync" icon="sync" />
                <ActionMenu
                  label={'Menu'}
                  menu={{
                    items: [
                      { key: 'A', label: 'Aaaa' },
                      { key: 'B', label: 'Bbbb' },
                    ],
                  }}
                />
              </HStack>
            }
          >
            <StyledLink>{task.name}</StyledLink>
          </StyledListItem>
        )}
      />
    </StyledCard>
  </VStack>
);
