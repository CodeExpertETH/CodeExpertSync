import React from "react";
import { StoryObj } from "@storybook/react";
import { TagButton, TagButtonProps } from "./TagButton";

export default {
  component: TagButton,
  args: { children: "Test" },
};

export const Primary = {
  args: {},
};

export const Orange = {
  args: {
    ...Primary.args,
    color: "orange",
  },
};

export const Red = {
  args: {
    ...Primary.args,
    color: "red",
  },
};

export const Green = {
  args: {
    ...Primary.args,
    color: "green",
  },
};
