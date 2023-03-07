import { Button, ButtonProps } from 'antd';
import React from 'react';

import { styled } from '../foundation/Theme';

const StyledTagButton = styled(Button, () => ({
  lineHeight: '20px',
  height: 'auto',
  padding: '0 7px',
  variants: {
    color: {
      green: {
        backgroundColor: '#87d068',
        borderColor: '#87d068',
        color: '#fff',
        '&:focus, &:hover': {
          backgroundColor: '#acde92',
          borderColor: '#66ab4d',
          color: '#66ab4d',
        },
      },
      orange: {
        backgroundColor: '#fa8c16',
        borderColor: '#fa8c16',
        color: '#fff',
        '&:focus, &:hover': {
          backgroundColor: '#ffa940',
          borderColor: '#d46b08',
          color: '#d46b08',
        },
      },
      red: {
        backgroundColor: '#f50',
        borderColor: '#f50',
        color: '#fff',
        '&:focus, &:hover': {
          backgroundColor: '#ff7729',
          borderColor: '#d94100',
          color: '#d94100',
        },
      },
    },
  },
}));

export type TagButtonProps = Omit<ButtonProps, 'color' | 'size'> & {
  color?: 'green' | 'orange' | 'red';
};

export const TagButton = (props: TagButtonProps) => (
  <StyledTagButton {...props} color={props.color} />
);
