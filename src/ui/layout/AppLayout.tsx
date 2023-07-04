import { Alert, Layout } from 'antd';
import React from 'react';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { styled } from '@/ui/foundation/Theme';
import { TopNav } from './TopNav';

const StyledLayout = styled(Layout, () => ({
  height: '100vh',
}));

const StyledAlert = styled(Alert, () => ({
  borderRadius: 0,
}));

const StyledLayoutHeader = styled(Layout.Header, ({ tokens }) => ({
  paddingInline: `${tokens.paddingSM}px !important`,
}));

const StyledContent = styled(Layout.Content, () => ({
  overflow: 'auto',
}));

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [{ online }] = useGlobalContextWithActions();

  return (
    <StyledLayout>
      {online ? null : (
        <StyledAlert
          message="You are offline. Please check your internet connection."
          type="warning"
          showIcon
        />
      )}
      <StyledLayoutHeader>
        <TopNav />
      </StyledLayoutHeader>
      <StyledContent>{children}</StyledContent>
    </StyledLayout>
  );
};
