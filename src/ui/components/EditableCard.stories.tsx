import { Meta, StoryObj } from '@storybook/react';
import { EditableCard } from '@/ui/components/EditableCard';

const meta: Meta<typeof EditableCard> = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'components/EditableCard',
  component: EditableCard,
  args: {
    iconName: 'angle-down',
    title: 'Card title',
    description: 'This is the description',
    value: 'This is the value',
    actions: [],
  },
};

export default meta;
type Story = StoryObj<typeof EditableCard>;

export const Primary: Story = {
  args: {
    title: 'Card title2',
  },
};

export const Profile: Story = {
  args: {
    iconName: 'user',
    title: 'Profile',
    description: 'Signed in as',
    value: 'Marty McFly',
    actions: [{ name: 'Log out…', iconName: 'sign-out-alt', danger: true, type: 'link' }],
  },
};

export const ProjectDir: Story = {
  args: {
    iconName: 'folder-open-regular',
    title: 'Project directory',
    description: 'All projects are synced into this directory',
    value: '/Users/marty/Documents/Studies/Programming/CodeExpert',
    actions: [
      { name: 'Change…', iconName: 'edit', type: 'link' },
      { name: 'Delete…', iconName: 'trash', danger: true, type: 'link' },
    ],
  },
};
