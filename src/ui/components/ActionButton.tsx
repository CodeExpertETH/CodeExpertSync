import { Button } from 'antd';
import { ButtonProps } from 'antd/es/button';
import React from 'react';

import { Icon, IconName } from '../foundation/Icons';
import { styled } from '../foundation/Theme';

const StyledButton = styled(Button, ({ tokens }) => ({
  display: 'block',
  color: tokens.colorIcon,
  fontSize: 16,
  paddingTop: '0.15em',
  paddingBottom: '0.15em',

  '&:not([disabled])': {
    '&.is-hover, &:hover': {
      background: tokens.colorBgTextHover,
      color: tokens.colorIconHover,
    },
    '&.is-active, &:active': {
      background: tokens.colorBgTextActive,
      color: tokens.colorText,
    },
  },

  '&.type-primary:not([disabled])': {
    background: tokens.colorPrimary,
    color: tokens.colorTextLightSolid,

    '&.is-hover, &:hover': {
      background: tokens.colorPrimaryHover,
      color: tokens.colorTextLightSolid,
    },
    '&.is-active, &:active': {
      background: tokens.colorPrimaryActive,
      color: tokens.colorTextLightSolid,
    },
  },
}));

export interface ActionButtonProps extends Omit<ButtonProps, 'icon' | 'shape' | 'title' | 'type'> {
  label: string;
  icon: IconName;
  state?: 'default' | 'hover' | 'active';
  type?: 'default' | 'primary';
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ label, icon, state = 'default', type = 'default', ...buttonProps }, ref) => (
    <StyledButton
      key={label}
      {...buttonProps}
      ref={ref}
      className={`is-${state} type-${type}`}
      shape={'circle'}
      type="text"
      title={label}
      aria-label={label}
      icon={<Icon name={icon} />}
    />
  ),
);
ActionButton.displayName = 'ActionButton';
