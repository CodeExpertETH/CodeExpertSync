import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { nonEmptyArray } from '@code-expert/prelude';
import { CourseHeader, CourseHeaderProps } from './CourseHeader';

const meta = {
  title: 'components/CourseHeader',
  component: CourseHeader,
  args: {
    title: 'Course',
    url: 'http://example.com',
  },
} satisfies Meta<typeof CourseHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const LongTitle = {
  args: {
    title: 'Erdwissenschaftliche Datenanalyse und Visualisierung',
  },
} satisfies Story;

const StatefulCourseHeader: typeof CourseHeader = (props) => {
  const items = nonEmptyArray.cons('Autumn 2023', ['Spring 2023', 'Autumn 2022']);
  const [selected, setSelected] = React.useState(items[0]);
  return <CourseHeader {...props} menu={{ selected, items, onClick: setSelected }} />;
};

export const Interactive = {
  render: (props: CourseHeaderProps) => <StatefulCourseHeader {...props} />,
} satisfies Story;
