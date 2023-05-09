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

const StyledContent = styled(Layout.Content, ({ tokens }) => ({
  overflow: 'auto',
  paddingInline: tokens.paddingSM,
}));

export const AppLayout = ({ children }: React.PropsWithChildren) => (
  <StyledLayout>
    <StyledLayoutHeader>
      <TopNav />
    </StyledLayoutHeader>
    <StyledContent>{children}</StyledContent>
  </StyledLayout>
);
