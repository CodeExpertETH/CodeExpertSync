import { Meta, StoryObj } from '@storybook/react';
import { List } from 'antd';
import React from 'react';
import { either, flow, taskEither } from '@code-expert/prelude';
import { localProject, openProject, syncProject } from '@/ui/components/ProjectList/testData';
import { ListItem } from './ListItem';

const meta = {
  title: 'components/ProjectList/ListItem',
  component: ListItem,
  args: {
    project: localProject,
    onOpen: openProject,
    onSync: syncProject,
  },
  render: (props) => (
    <List size="small">
      <ListItem {...props} />
    </List>
  ),
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const FailOpen = {
  args: {
    onOpen: flow(
      openProject,
      taskEither.chainEitherK(() =>
        either.left('The project does not exist where it was expected.'),
      ),
    ),
  },
} satisfies Story;

export const FailSync = {
  args: {
    onSync: flow(
      syncProject,
      taskEither.chainEitherK(() => either.left('The project could not be synced.')),
    ),
  },
} satisfies Story;

export const FailBoth = {
  args: {
    onOpen: flow(
      openProject,
      taskEither.chainEitherK(() =>
        either.left('The project does not exist where it was expected.'),
      ),
    ),
    onSync: flow(
      syncProject,
      taskEither.chainEitherK(() => either.left('The project could not be synced.')),
    ),
  },
} satisfies Story;
