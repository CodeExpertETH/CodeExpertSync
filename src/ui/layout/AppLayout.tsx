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

export const AppLayout = ({ children }: React.PropsWithChildren) => (
  <StyledLayout>
    <StyledLayoutHeader>
      <TopNav />
    </StyledLayoutHeader>
    <StyledContent>{children}</StyledContent>
  </StyledLayout>
);
