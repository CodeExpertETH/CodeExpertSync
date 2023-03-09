import React from 'react';

import { AppLayout } from './AppLayout';

export default {
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
    padded: false,
  },
};

export const Default = {
  args: {
    children: (
      <div>
        <h1>Code Expert Desktop</h1>
        <p>👋 Hello from the team!</p>
      </div>
    ),
  },
};
