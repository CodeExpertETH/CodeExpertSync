import React from 'react';
import { Layout, Menu } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import codeExpertLogo from '../../assets/logo_invert.png';
import { Icon } from '../foundation/Icons';

export function TopNavLayoutWrapper({
  menu,
  children,
}: React.PropsWithChildren<{ menu: ItemType[] }>) {
  return (
    <Layout>
      <Layout.Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
        <div
          style={{
            float: 'left',
            width: 221,
            height: 40,
            margin: '12px 24px 12px 0',
          }}
        >
          <img src={codeExpertLogo} height="40" alt="Code Expert" />
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[]}
          triggerSubMenuAction="click"
          style={{ float: 'right' }}
          items={menu}
        />
      </Layout.Header>
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
