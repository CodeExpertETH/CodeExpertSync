import { Menu } from 'antd';
import React from 'react';
import codeExpertLogo from '@/assets/logo_invert.png';
import { globalSetupState } from '@/domain/Setup';
import { routes, useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack } from '@/ui/foundation/Layout';

export const TopNav = () => {
  const [{ setupState }, dispatch] = useGlobalContextWithActions();

  const onClick = ({ key }: { key: string }) => {
    if (key === 'settings') {
      dispatch({ currentPage: routes.settings() });
    } else if (key === 'logout') {
      dispatch({ currentPage: routes.logout() });
    }
  };

  return (
    <HStack justify={'space-between'} align="center">
      <img
        src={codeExpertLogo}
        height="40"
        alt="Code Expert"
        aria-hidden="true"
        onClick={() => dispatch({ currentPage: routes.main() })}
      />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[]}
        onClick={onClick}
        disabled={globalSetupState.fold(setupState, {
          setup: () => true,
          setupDone: () => false,
        })}
        triggerSubMenuAction="click"
        items={[
          {
            key: 'enrolled',
            label: <Icon name="bars" />,
            children: [
              {
                key: 'settings',
                label: (
                  <HStack gap={'xs'} align="center">
                    <Icon name="cog" /> Settings
                  </HStack>
                ),
              },
              { type: 'divider' },
              {
                key: 'logout',
                label: (
                  <HStack gap={'xs'} align="center">
                    <Icon name="sign-out-alt" /> Logout
                  </HStack>
                ),
              },
            ],
          },
        ]}
      />
    </HStack>
  );
};
