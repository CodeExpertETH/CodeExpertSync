import { Preview } from '@storybook/react';
import React from 'react';
import { GlobalContextProvider } from '../src/ui/GlobalContext';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => React.createElement(GlobalContextProvider, {}, React.createElement(Story)),
  ],
};

export default preview;
