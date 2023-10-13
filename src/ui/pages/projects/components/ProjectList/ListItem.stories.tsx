import { Meta, StoryObj } from '@storybook/react';
import { List } from 'antd';
import React from 'react';
import { either, flow, taskEither } from '@code-expert/prelude';
import { syncExceptionADT } from '@/domain/SyncException';
import { fromTauriError } from '@/lib/tauri/TauriException';
import {
  localProject,
  openProject,
  removeProject,
  revertFile,
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
    onRevertFile: revertFile,
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
        either.left(fromTauriError('The project does not exist where it was expected.')),
      ),
    ),
  },
} satisfies Story;

export const FailSync = {
  args: {
    onSync: flow(
      syncProject,
      taskEither.mapLeft(() => syncExceptionADT.invalidFilename('SB_INVALID_FILENAME')),
    ),
  },
} satisfies Story;

export const FailBoth = {
  args: {
    onOpen: flow(
      openProject,
      taskEither.chainEitherK(() =>
        either.left(fromTauriError('The project does not exist where it was expected.')),
      ),
    ),
    onSync: flow(
      syncProject,
      taskEither.mapLeft(() => syncExceptionADT.invalidFilename('SB_INVALID_FILENAME')),
    ),
  },
} satisfies Story;
