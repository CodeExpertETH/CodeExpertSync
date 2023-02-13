import React from "react";
import { useTheme } from "../Theme";
import { Box, BoxProps } from "./Box";
import { Story } from "@storybook/react/types-6-0";

export default {
  title: "Foundation/Layout/Box",
  component: Box,
};

const Template: Story<BoxProps<"div">> = ({ style, fill, ...props }) => {
  const { tokens } = useTheme();
  const baseStyles = {
    borderRadius: 6,
    height: 100,
    opacity: 0.9,
    ...style,
  };
  return (
    <>
      <Box style={{ ...baseStyles, background: tokens["cyan-3"] }} {...props}>
        Box 1
      </Box>
      <Box
        style={{ ...baseStyles, background: tokens["cyan-5"] }}
        {...props}
        fill={fill /* Only apply fill to middle element for our demo */}
      >
        Box 2 (this one has text content that is a bit longer than the others to
        test overflow)
      </Box>
      <Box style={{ ...baseStyles, background: tokens["cyan-7"] }} {...props}>
        Box 3
      </Box>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};

export const Inline = Template.bind({});
Inline.args = { inline: true };

export const Fill = Template.bind({});
Fill.args = { fill: true, style: { width: 100 } };

export const Link = (Template as Story<BoxProps<"a">>).bind({});
Link.args = { as: "a", href: "http://example.com" };

export const BoxArea = (Template as Story<BoxProps<"a">>).bind({});
BoxArea.args = { mt: 24, pa: 8 };
