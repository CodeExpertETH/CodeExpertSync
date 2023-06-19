import { Button, Dropdown, MenuProps, Typography } from 'antd';
import React from 'react';
import { constVoid } from '@code-expert/prelude';
import { Icon } from '@/ui/foundation/Icons';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';

const StyledTitle = styled(Typography.Title, () => ({
  marginTop: 0,
  marginBottom: '0.2em !important',
}));

const StyledExternalLink = styled(Typography.Link, ({ tokens }) => ({
  '&.ant-typography': {
    color: tokens.colorIcon,
    '&:hover': {
      color: tokens.colorLink,
    },
    '&:active': {
      color: tokens.colorLinkActive,
    },
  },
}));

const StyledButton = styled(Button, () => ({
  height: 'auto',
  padding: 0,
}));

interface Menu {
  selected: string;
  items: NonEmptyArray<string>;
  onClick(selected: string): void;
}

export interface CourseHeaderProps {
  title: string;
  url?: string;
  menu?: Menu;
}

export const CourseHeader = ({ title, url, menu }: CourseHeaderProps) => (
  <VStack>
    <HStack align={'baseline'} justify={'space-between'}>
      <StyledTitle level={4}>{title}</StyledTitle>
      {url != null && (
        <StyledExternalLink href={url} title="Open in browser" target={'_blank'}>
          <Icon name={'external-link-alt'} />
        </StyledExternalLink>
      )}
    </HStack>
    {menu != null && (
      <Dropdown menu={buildMenu(menu)} trigger={['click']}>
        <StyledButton type={'link'}>
          <HStack gap={'xxs'} align="center">
            <span>{menu.selected}</span>
            <Icon name="angle-down" />
          </HStack>
        </StyledButton>
      </Dropdown>
    )}
  </VStack>
);

const buildMenu = (menu: Menu): MenuProps => ({
  selectedKeys: [menu.selected],
  items: menu.items.map((label) => ({
    key: label,
    label,
    onClick: label === menu.selected ? constVoid : () => menu.onClick(label),
  })),
});
