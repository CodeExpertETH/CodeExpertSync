import { Meta, StoryObj } from '@storybook/react';
import { nonEmptyArray } from '@code-expert/prelude';
import {
  localProject,
  openProject,
  remoteProject,
  syncProject,
} from '@/ui/components/ProjectList/testData';
import { List } from './List';

const meta = {
  title: 'components/ProjectList/List',
  component: List,
  args: {
    exerciseName: 'Exercise 8: Two-Dimensional vectors, Characters, Recursion',
    projects: nonEmptyArray.cons(localProject, [remoteProject, localProject]),
    onOpen: openProject,
    onSync: syncProject,
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
