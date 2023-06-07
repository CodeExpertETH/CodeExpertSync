import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { syncButtonStateADT } from '@/ui/components/ProjectList/model/SyncButtonState';
import { SyncButton } from './SyncButton';

const meta = {
  title: 'components/ProjectList/SyncButton',
  component: SyncButton,
  args: {
    now: () => new Date(),
  },
} satisfies Meta<typeof SyncButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Remote = {
  args: {
    state: syncButtonStateADT.remote(),
  },
} satisfies Story;

export const Synced = {
  args: {
    state: syncButtonStateADT.synced(new Date()),
  },
  // For this story, make sure that the synced state always uses the date at the time of rendering
  render: (props) => <SyncButton {...props} state={syncButtonStateADT.synced(new Date())} />,
} satisfies Story;

export const Syncing = {
  args: {
    state: syncButtonStateADT.syncing(),
  },
} satisfies Story;

export const ChangesRemote = {
  args: {
    state: syncButtonStateADT.changesRemote(),
  },
} satisfies Story;

export const ChangesLocal = {
  args: {
    state: syncButtonStateADT.changesLocal(),
  },
} satisfies Story;

export const ChangesBoth = {
  args: {
    state: syncButtonStateADT.changesBoth(),
  },
} satisfies Story;

export const Warning = {
  args: {
    state: syncButtonStateADT.warning(new Date()),
  },
  // For this story, make sure that the warning state always uses the date at the time of rendering
  render: (props) => <SyncButton {...props} state={syncButtonStateADT.warning(new Date())} />,
} satisfies Story;
