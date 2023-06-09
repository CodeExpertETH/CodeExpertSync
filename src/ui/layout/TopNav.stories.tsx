import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { TopNav } from './TopNav';

const meta = {
  component: TopNav,
  args: {
    clientId: 'client-1' as ClientId,
  },
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary = {
  render: (props) => (
    <div
      style={{
        background: '#001529', // This is hard-coded in Antd at the moment, we can't get at it otherwise.
      }}
    >
      <TopNav {...props} />
    </div>
  ),
} satisfies Story;
