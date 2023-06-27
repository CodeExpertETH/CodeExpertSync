import { Breadcrumb, Typography } from 'antd';
import React from 'react';
import { Icon } from '@/ui/foundation/Icons';
import { HStack, VStack } from '@/ui/foundation/Layout';
import { styled } from '@/ui/foundation/Theme';

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

export interface CourseHeaderProps {
  title: string;
  semester: string;
  codeExpertCourseUrl?: string;
  goOverview: () => void;
}

export const CourseHeader = ({
  title,
  semester,
  codeExpertCourseUrl,
  goOverview,
}: CourseHeaderProps) => (
  <VStack>
    <HStack align="center" justify={'start'}>
      <Breadcrumb
        items={[
          {
            onClick: goOverview,
            path: '/home',
            title: <Icon name="home" />,
          },
          {
            title: semester,
          },
          {
            title,
            menu:
              codeExpertCourseUrl != null
                ? {
                    items: [
                      {
                        key: 'openExtern',
                        label: (
                          <StyledExternalLink
                            href={codeExpertCourseUrl}
                            title="Open in browser"
                            target={'_blank'}
                          >
                            <Icon name={'external-link-alt'} /> Open in Code Expert
                          </StyledExternalLink>
                        ),
                      },
                    ],
                  }
                : undefined,
          },
        ]}
      />
    </HStack>
  </VStack>
);
