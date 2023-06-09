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

export const AppLayout = ({
  children,
  clientId,
}: React.PropsWithChildren<{ clientId: ClientId }>) => (
  <StyledLayout>
    <StyledLayoutHeader>
      <TopNav clientId={clientId} />
    </StyledLayoutHeader>
    <StyledContent>{children}</StyledContent>
  </StyledLayout>
);
