import { Menu } from 'antd';
import React from 'react';
import { constFalse, constTrue } from '@code-expert/prelude';
import logo from '@/assets/logo-inverted.svg';
import { globalSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack } from '@/ui/foundation/Layout';
import { routes, useRoute } from '@/ui/routes';

export const TopNav = () => {
  const [{ setupState, online }] = useGlobalContextWithActions();
  const { navigateTo } = useRoute();

  const onClick = ({ key }: { key: string }) => {
    if (key === 'settings') {
      navigateTo(routes.settings());
    } else if (key === 'logout') {
      navigateTo(routes.logout());
    }
  };

  return (
    <HStack justify={'space-between'} align="center">
      <img
        src={logo}
        height="64"
        alt="Code Expert"
        aria-hidden="true"
        onClick={() => navigateTo(routes.courses())}
      />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[]}
        onClick={onClick}
        disabled={globalSetupState.fold(setupState, {
          setup: constTrue,
          setupDone: online ? constFalse : constTrue,
          update: constTrue,
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
