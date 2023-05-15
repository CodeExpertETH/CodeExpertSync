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

const CardMainContent = styled('div', () => ({
  flexGrow: 5,
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
        <GrayIcon name={props.iconName} size="4x" />
        <CardMainContent>
          <Typography.Paragraph type="secondary">{props.description}</Typography.Paragraph>
          <Typography.Paragraph>{props.value}</Typography.Paragraph>
        </CardMainContent>
        <CardAction>
          {props.actions.map((action) => (
            <Button
              key={action.name}
              {...action}
              style={
                action.type === 'link'
                  ? {
                      paddingBottom: 0,
                      borderBottom: 0,
                    }
                  : {}
              }
              icon={<Icon name={action.iconName} />}
            >
              {action.name}
            </Button>
          ))}
        </CardAction>
      </CardContainer>
    </Card>
  </div>
);
