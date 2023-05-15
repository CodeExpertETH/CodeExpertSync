import { Story } from '@storybook/react';
import React from 'react';
import { nonEmptyArray } from '@code-expert/prelude';
import { TaskList, TaskListProps } from './TaskList';

export default {
  title: 'components/TaskList',
  component: TaskList,
};

const Template: Story<Partial<TaskListProps>> = ({
  exerciseName = 'Exercise 8: Two-Dimensional vectors, Characters, Recursion',
  tasks = nonEmptyArray.cons({ name: 'Task 1: Finite Rings' }, [
    { name: 'Task 1.5: two complement integer representations' },
  ]),
}) => <TaskList exerciseName={exerciseName} tasks={tasks} />;

export const Default = Template.bind({});
Default.args = {};
