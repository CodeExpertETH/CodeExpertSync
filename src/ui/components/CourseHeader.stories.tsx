import { Meta, StoryObj } from '@storybook/react';
import { CourseHeader } from './CourseHeader';

const meta = {
  title: 'components/CourseHeader',
  component: CourseHeader,
  args: {
    title: 'Course',
    semester: { season: 'S', year: 2022 },
    goOverview: () => {
      console.log('goOverview');
      return;
    },
  },
} satisfies Meta<typeof CourseHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;

export const LongTitle = {
  args: {
    title: 'Erdwissenschaftliche Datenanalyse und Visualisierung',
    semester: { season: 'S', year: 2022 },
    codeExpertCourseUrl: 'http://example.com',
  },
} satisfies Story;
