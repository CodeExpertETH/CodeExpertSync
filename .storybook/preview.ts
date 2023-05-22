import { Preview } from '@storybook/react';
import React from 'react';
import { GlobalContextProvider } from '../src/ui/GlobalContext';
import { TimeContextProvider } from '../src/ui/contexts/TimeContext';

const testTimeContext = {
  now: () => new Date('2023-05-06T11:00:00Z'),
};
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
    (Story) =>
      React.createElement(
        TimeContextProvider,
        { value: testTimeContext },
        React.createElement(Story),
      ),
  ],
};

export default preview;
