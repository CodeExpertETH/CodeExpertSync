import { Story } from '@storybook/react';
import React from 'react';
import { ActionMenu, ActionMenuProps } from './ActionMenu';

export default {
  title: 'components/ActionMenu',
  component: ActionMenu,
};

const Template: Story<Partial<ActionMenuProps>> = ({
  menu = {
    items: [
      {
        key: '1',
        label: 'One',
      },
      {
        key: '2',
        label: 'Two',
      },
    ],
  },
}) => <ActionMenu menu={menu} label={'Menu'} />;

export const Default = Template.bind({});
Default.args = {};
