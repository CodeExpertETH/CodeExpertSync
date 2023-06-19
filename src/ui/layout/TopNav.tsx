import { Menu } from 'antd';
import React from 'react';
import codeExpertLogo from '@/assets/logo_invert.png';
import { ClientId } from '@/domain/ClientId';
import { globalSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import { HStack } from '@/ui/foundation/Layout';
import { routes, useRoute } from '@/ui/routes';

export const TopNav = ({ clientId }: { clientId: ClientId }) => {
  const [{ setupState }] = useGlobalContextWithActions();
  const { navigateTo } = useRoute();

  const onClick = ({ key }: { key: string }) => {
    if (key === 'settings') {
      navigateTo(routes.settings(clientId));
    } else if (key === 'logout') {
      navigateTo(routes.logout(clientId));
    }
  };

  return (
    <HStack justify={'space-between'} align="center">
      <img
        src={codeExpertLogo}
        height="40"
        alt="Code Expert"
        aria-hidden="true"
        onClick={() => navigateTo(routes.courses(clientId))}
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
