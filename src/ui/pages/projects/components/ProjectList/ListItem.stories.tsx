import { Meta, StoryObj } from '@storybook/react';
import { List } from 'antd';
import React from 'react';
import { either, flow, taskEither } from '@code-expert/prelude';
import { syncExceptionADT } from '@/domain/SyncException';
import {
  localProject,
  openProject,
  removeProject,
  syncProject,
} from '@/ui/pages/projects/components/ProjectList/testData';
import { ListItem } from './ListItem';

const meta = {
  title: 'pages/projects/ProjectList/ListItem',
  component: ListItem,
  args: {
    project: localProject,
    onOpen: openProject,
    onSync: syncProject,
    onRemove: removeProject,
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
      taskEither.mapLeft(() => syncExceptionADT.projectDirMissing()),
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
      taskEither.mapLeft(() => syncExceptionADT.projectDirMissing()),
    ),
  },
} satisfies Story;
