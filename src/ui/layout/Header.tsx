import React from 'react';
import { Layout, Menu } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import codeExpertLogo from '../../assets/logo_invert.png';
import { Icon } from '../foundation/Icons';
import { styled } from '../foundation/Theme';
import { HStack } from '../foundation/Layout';

const StyledLayoutHeader = styled(Layout.Header, ({ tokens }) => ({
  padding: `0 ${tokens.paddingSM}px !important`,
  position: 'sticky',
  top: '0 !important',
  zIndex: 1,
  width: '100%',
}));

export function TopNavLayoutWrapper({
  menu,
  children,
}: React.PropsWithChildren<{ menu: ItemType[] }>) {
  return (
    <Layout>
      <StyledLayoutHeader>
        <HStack justify={'space-between'} align="center">
          <img src={codeExpertLogo} height="40" alt="Code Expert" />
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[]}
            triggerSubMenuAction="click"
            items={menu}
          />
        </HStack>
      </StyledLayoutHeader>
      {children}
    </Layout>
  );
}

export function Header({ children }: React.PropsWithChildren) {
  return (
    <TopNavLayoutWrapper
      menu={[
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
    >
      {children}
    </TopNavLayoutWrapper>
  );
}
