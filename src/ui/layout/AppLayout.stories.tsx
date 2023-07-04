import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AppLayout } from './AppLayout';

const meta = {
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
    padded: false,
  },
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  args: {
    children: (
      <div>
        <h1>Code Expert Sync</h1>
        <p>👋 Hello from the team!</p>
      </div>
    ),
  },
} satisfies Story;
