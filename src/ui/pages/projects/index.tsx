import { useProperty } from '@frp-ts/react';
import { Typography } from 'antd';
import React from 'react';
import {
  array,
  constVoid,
  flow,
  nonEmptyArray,
  option,
  pipe,
  taskEither,
} from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { globalSetupState, setupState } from '@/domain/Setup';
import { invariantViolated } from '@/domain/exception';
import { useGlobalContext, useGlobalContextWithActions } from '@/ui/GlobalContext';
import { CourseHeader } from '@/ui/components/CourseHeader';
import { VStack } from '@/ui/foundation/Layout';
import { PageLayout } from '@/ui/layout/PageLayout';
import { CourseItem, courseItemEq, fromProject } from '@/ui/pages/courses/components/model';
import { ProjectList } from '@/ui/pages/projects/components/ProjectList';
import { projectsByExercise } from '@/ui/pages/projects/components/ProjectList/model/Exercise';
import { useProjectOpen } from '@/ui/pages/projects/hooks/useProjectOpen';
import { useProjectSync } from '@/ui/pages/projects/hooks/useProjectSync';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';

export function Projects({ clientId, course }: { clientId: ClientId; course: CourseItem }) {
  const [{ projectRepository }, dispatch] = useGlobalContextWithActions();
  const projects = pipe(
    useProperty(projectRepository.projects),
    array.filter((project) => courseItemEq.equals(fromProject(project), course)),
  );
  const openProject = useProjectOpen();
  const syncProject = useProjectSync();

  useProjectEventUpdate(projectRepository.fetchChanges, clientId);

  return (
    <PageLayout>
      <CourseHeader title={course.name} />
      {pipe(
        nonEmptyArray.fromArray(projects),
        option.map(projectsByExercise),
        option.map(
          nonEmptyArray.map(({ name, projects }) => (
            <ProjectList
              key={name}
              exerciseName={name}
              projects={projects}
              onOpen={flow(
                openProject,
                taskEither.fromTaskOption(() => 'Could not open project'),
              )}
              onSync={(projectId, force) =>
                pipe(
                  projectRepository.getProject(projectId),
                  taskEither.fromTaskOption(() => {
                    throw invariantViolated('Project to sync not found');
                  }),
                  taskEither.chainFirst((project) => syncProject(project, { force })),
                  taskEither.map(constVoid),
                )
              }
              onRemove={projectRepository.removeProject}
            />
          )),
        ),
        option.fold(
          () => {
            dispatch({ setupState: globalSetupState.setup({ state: setupState.noProjectSync() }) });
          },
          (xs) => <VStack gap="lg">{xs}</VStack>,
        ),
      )}
    </PageLayout>
  );
}
