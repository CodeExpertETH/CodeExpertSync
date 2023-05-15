import { Button, Card, Typography } from 'antd';
import { ButtonProps } from 'antd/es/button';
import React from 'react';
import { Icon, IconName } from '@/ui/foundation/Icons';
import { styled } from '@/ui/foundation/Theme';

interface Action extends ButtonProps {
  name: string;
  iconName: IconName;
}

export interface EditableCardProps {
  iconName: IconName;
  title: string;
  description: string;
  value: string;
  actions: Array<Action>;
}

const CardContainer = styled('div', () => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
}));

const GrayIcon = styled(Icon, ({ tokens }) => ({
  color: tokens.colorIcon,
}));

const CardMain = styled('div', () => ({
  display: 'flex',
  gap: '1rem',
}));

const CardMainContent = styled('div', () => ({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  'div:last-child': {
    margin: 0,
  },
}));

const CardAction = styled('div', () => ({
  flex: '1 0 auto',
  alignSelf: 'flex-end',
  display: 'flex',
  justifyContent: 'flex-end',
}));

export const EditableCard = (props: EditableCardProps) => (
  <div>
    <h2>{props.title}</h2>
    <Card>
      <CardContainer>
        <CardMain>
          <GrayIcon name={props.iconName} size="4x" />
          <CardMainContent>
            <Typography.Paragraph type="secondary">{props.description}</Typography.Paragraph>
            <Typography.Paragraph>{props.value}</Typography.Paragraph>
          </CardMainContent>
        </CardMain>
        <CardAction>
          {props.actions.map(({ name, iconName, ...buttonProps }) => (
            <Button
              key={name}
              {...buttonProps}
              style={
                buttonProps.type === 'link'
                  ? {
                      paddingBottom: 0,
                      borderBottom: 0,
                    }
                  : {}
              }
              icon={<Icon name={iconName} />}
            >
              {name}
            </Button>
          ))}
        </CardAction>
      </CardContainer>
    </Card>
  </div>
);
