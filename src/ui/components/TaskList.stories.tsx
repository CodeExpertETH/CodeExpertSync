import { Meta, StoryObj } from '@storybook/react';
import { nonEmptyArray } from '@code-expert/prelude';
import { TaskList } from './TaskList';

const meta = {
  title: 'components/TaskList',
  component: TaskList,
  args: {
    exerciseName: 'Exercise 8: Two-Dimensional vectors, Characters, Recursion',
    tasks: nonEmptyArray.cons({ name: 'Task 1: Finite Rings' }, [
      { name: 'Task 1.5: two complement integer representations' },
    ]),
  },
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
