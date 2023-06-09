import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
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
    clientId: 'client-1' as ClientId,
    children: (
      <div>
        <h1>Code Expert Desktop</h1>
        <p>👋 Hello from the team!</p>
      </div>
    ),
  },
} satisfies Story;
