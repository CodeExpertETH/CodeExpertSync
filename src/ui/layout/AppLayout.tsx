import { Alert, Layout } from 'antd';
import React from 'react';
import { constNull } from '@code-expert/prelude';
import { useGlobalContext } from '@/ui/GlobalContext';
import { styled } from '@/ui/foundation/Theme';
import { foldConnectionStatus } from '@/ui/hooks/useNetwork';
import { TopNav } from './TopNav';

const StyledLayout = styled(Layout, () => ({
  height: '100vh',
}));

const StyledAlert = styled(Alert, () => ({
  borderRadius: 0,
}));

const StyledLayoutHeader = styled(Layout.Header, ({ tokens }) => ({
  paddingInlineStart: `4px !important`, // Magic number that works well for logo's padding
  paddingInlineEnd: `${tokens.paddingSM}px !important`,
}));

const StyledContent = styled(Layout.Content, () => ({
  overflow: 'auto',
}));

export interface AppLayoutProps {
  setup?: boolean;
  children: React.ReactNode;
}

export const AppLayout = ({ setup = false, children }: AppLayoutProps) => {
  const { connectionStatus } = useGlobalContext();

  return (
    <StyledLayout>
      {setup
        ? null
        : foldConnectionStatus(connectionStatus, {
            noNetwork: () => (
              <StyledAlert
                message="You are offline. Please check your internet connection."
                type="warning"
                showIcon
              />
            ),
            noConnection: () => (
              <StyledAlert
                message="Our servers are unreachable. Trying to reconnect..."
                type="warning"
                showIcon
              />
            ),
            online: constNull,
          })}
      <StyledLayoutHeader>
        <TopNav />
      </StyledLayoutHeader>
      <StyledContent>{children}</StyledContent>
    </StyledLayout>
  );
};
