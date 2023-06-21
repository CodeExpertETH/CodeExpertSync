import { Layout } from 'antd';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
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
  clientId: ClientId;
  children: React.ReactNode;
}

export const AppLayout = ({ children, clientId }: AppLayoutProps) => (
  <StyledLayout>
    <StyledLayoutHeader>
      <TopNav clientId={clientId} />
    </StyledLayoutHeader>
    <StyledContent>{children}</StyledContent>
  </StyledLayout>
);
