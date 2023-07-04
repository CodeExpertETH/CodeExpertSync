import { Layout } from 'antd';
import React from 'react';
import { styled } from '@/ui/foundation/Theme';
import { TopNav } from './TopNav';

const StyledLayout = styled(Layout, () => ({
  height: '100vh',
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

export const AppLayout = ({ children }: AppLayoutProps) => (
  <StyledLayout>
    <StyledLayoutHeader>
      <TopNav />
    </StyledLayoutHeader>
    <StyledContent>{children}</StyledContent>
  </StyledLayout>
);
