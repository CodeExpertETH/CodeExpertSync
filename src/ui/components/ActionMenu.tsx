import { Dropdown } from 'antd';
import type { DropdownProps } from 'antd/es/dropdown/dropdown';
import React from 'react';

import { ActionButton, ActionButtonProps } from './ActionButton';

export interface ActionMenuProps
  extends Pick<DropdownProps, 'menu' | 'destroyPopupOnHide'>,
    Pick<ActionButtonProps, 'disabled'> {
  label: string;
}

export const ActionMenu = React.forwardRef<HTMLButtonElement, ActionMenuProps>(
  ({ label, destroyPopupOnHide = true, disabled, ...props }, ref) => (
    <Dropdown trigger={['click']} {...props} destroyPopupOnHide={destroyPopupOnHide}>
      <ActionButton label={label} icon={'ellipsis-v'} ref={ref} disabled={disabled} />
    </Dropdown>
  ),
);
ActionMenu.displayName = 'ActionMenu';
