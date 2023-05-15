import { Story } from '@storybook/react';
import React from 'react';
import { nonEmptyArray } from '@code-expert/prelude';
import { CourseHeader, CourseHeaderProps } from './CourseHeader';

export default {
  title: 'components/CourseHeader',
  component: CourseHeader,
};

const Template: Story<Partial<CourseHeaderProps>> = ({
  title = 'Course',
  url = 'http://example.com',
  menu,
}) => <CourseHeader title={title} menu={menu} url={url} />;

export const Default = Template.bind({});
Default.args = {};

export const LongTitle = Template.bind({});
LongTitle.args = {
  title: 'Erdwissenschaftliche Datenanalyse und Visualisierung',
};

export const Interactive = () => {
  const items = nonEmptyArray.cons('Autumn 2023', ['Spring 2023', 'Autumn 2022']);
  const [selected, setSelected] = React.useState(items[0]);
  return (
    <Template
      title="Grundlagen der Informatik"
      url="http://example.com"
      menu={{ selected, items, onClick: setSelected }}
    />
  );
};
