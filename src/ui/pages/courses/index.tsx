import { useProperty } from '@frp-ts/react';
import { Typography } from 'antd';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { useGlobalContext } from '@/ui/GlobalContext';
import { styled } from '@/ui/foundation/Theme';
import { PageLayout } from '@/ui/layout/PageLayout';
import { CourseList } from '@/ui/pages/courses/components/CourseList';
import { CourseItem, coursesFromProjects } from '@/ui/pages/courses/components/model';
import { routes, useRoute } from '@/ui/routes';

const StyledTitle = styled(Typography.Title, () => ({
  marginTop: 0,
  marginBottom: '0.2em !important',
}));

export const Courses = ({ clientId }: { clientId: ClientId }) => {
  const { navigateTo } = useRoute();
  const { projectRepository } = useGlobalContext();
  const projects = useProperty(projectRepository.projects);
  const courses = coursesFromProjects(projects);

  const onOpen = React.useCallback(
    (course: CourseItem) => {
      navigateTo(routes.projects({ clientId, course }));
    },
    [clientId, navigateTo],
  );

  return (
    <PageLayout>
      <StyledTitle level={4}>Courses</StyledTitle>
      <CourseList courses={courses} onOpen={onOpen} />
    </PageLayout>
  );
};
