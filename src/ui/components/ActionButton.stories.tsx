import { Story } from '@storybook/react';
import React from 'react';

import { ActionButton, ActionButtonProps } from './ActionButton';

export default {
  title: 'components/ActionButton',
  component: ActionButton,
};

const Template: Story<Partial<ActionButtonProps>> = ({
  label = 'Click',
  icon = 'ellipsis-v',
  ...props
}) => <ActionButton label={label} icon={icon} {...props} />;

export const Default = Template.bind({});
Default.args = {};

export const Hover = Template.bind({});
Hover.args = { state: 'hover' };

export const Active = Template.bind({});
Active.args = { state: 'active' };

export const Primary = Template.bind({});
Primary.args = { type: 'primary' };
