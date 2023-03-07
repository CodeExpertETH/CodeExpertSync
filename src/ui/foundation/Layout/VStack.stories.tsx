import { Story } from '@storybook/react';
import React from 'react';

import * as BoxStories from './Box.stories';
import { StackProps, VStack } from './Stack';

export default {
  title: 'Foundation/Layout/VStack',
  component: VStack,
};

const Template: Story<StackProps<'div'>> = ({
  children = <BoxStories.Default {...BoxStories.Default.args} />,
  ...props
}) => <VStack {...props}>{children}</VStack>;

export const Default = Template.bind({});
Default.args = {};

export const WithGap = Template.bind({});
WithGap.args = { gap: 'md' };

export const WithArea = Template.bind({});
WithArea.args = { mh: 24, pv: 24 };

export const InlineChildren = Template.bind({});
InlineChildren.args = {
  gap: 'md',
  children: <BoxStories.Inline {...BoxStories.Inline.args} />,
};

export const Fill = Template.bind({});
Fill.args = { children: <BoxStories.Fill {...BoxStories.Fill.args} /> };

export const FillWithConstraint = () => (
  <VStack gap={'xs'} style={{ height: 280 }} marginTrim={'block'}>
    <BoxStories.Fill {...BoxStories.Fill.args} />
  </VStack>
);
