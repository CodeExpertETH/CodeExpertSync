import { Menu } from 'antd';
import React from 'react';

import codeExpertLogo from '../../assets/logo_invert.png';
import { Icon } from '../foundation/Icons';
import { HStack } from '../foundation/Layout';

export const TopNav = () => (
  <HStack justify={'space-between'} align="center">
    <img src={codeExpertLogo} height="40" alt="Code Expert" />
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[]}
      triggerSubMenuAction="click"
      items={[
        {
          key: 'enrolled',
          label: <Icon name="bars" />,
          children: [
            {
              key: 'settings',
              label: (
                <>
                  <Icon name="cog" /> Settings
                </>
              ),
            },
            { type: 'divider' },
            {
              key: 'logout',
              label: (
                <>
                  <Icon name="sign-out-alt" /> Logout
                </>
              ),
            },
          ],
        },
      ]}
    />
  </HStack>
);
