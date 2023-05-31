import { Meta, StoryObj } from '@storybook/react';
import { mkProjectRepositoryTauri } from '@/infrastructure/ProjectRepositoryTauri';
import { App } from './App';

const projectRepository = await mkProjectRepositoryTauri()(); // FIXME Needs a pure implementation for testing

const meta = {
  component: App,
  args: {
    projectRepository,
  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground = {} satisfies Story;
