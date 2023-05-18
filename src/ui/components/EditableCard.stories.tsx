import { Meta, StoryObj } from '@storybook/react';
import { EditableCard } from '@/ui/components/EditableCard';

const meta = {
  title: 'components/EditableCard',
  component: EditableCard,
  args: {
    iconName: 'angle-down',
    title: 'Card title',
    description: 'This is the description',
    value: 'This is the value',
    actions: [],
  },
} satisfies Meta<typeof EditableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary = {
  args: {
    title: 'Card title2',
  },
} satisfies Story;

export const Profile = {
  args: {
    iconName: 'user',
    title: 'Profile',
    description: 'Signed in as',
    value: 'Marty McFly',
    actions: [{ name: 'Log out…', iconName: 'sign-out-alt', danger: true, type: 'link' }],
  },
} satisfies Story;

export const ProjectDir = {
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
} satisfies Story;
