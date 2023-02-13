import React from "react";
import { Story } from "@storybook/react";
import { TagButton, TagButtonProps } from "./TagButton";

export default {
  title: "components/TagButton",
  component: TagButton,
};

const Template: Story<TagButtonProps> = ({ color, ...props }) => (
  <TagButton color={color} {...props}>
    Test
  </TagButton>
);

export const Default = Template.bind({});
Default.args = {};
export const Orange = Template.bind({});
Orange.args = { color: "orange" };

export const Red = Template.bind({});
Red.args = { color: "red" };

export const Green = Template.bind({});
Green.args = { color: "green" };
