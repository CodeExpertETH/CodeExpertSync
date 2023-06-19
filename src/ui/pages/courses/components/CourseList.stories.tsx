import { Meta, StoryObj } from '@storybook/react';
import { CourseList } from './CourseList';
import { testCourses } from './testData';

const meta = {
  title: 'pages/courses/CourseList',
  component: CourseList,
  args: {
    courses: testCourses,
    onOpen: () => {
      alert('Clicked');
    },
  },
} satisfies Meta<typeof CourseList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const Empty = {
  args: {
    courses: [],
  },
} satisfies Story;
