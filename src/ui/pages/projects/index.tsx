import { useProperty } from '@frp-ts/react';
import React from 'react';
import { array, constVoid, flow, pipe, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { useGlobalContext } from '@/ui/GlobalContext';
import { CourseHeader } from '@/ui/components/CourseHeader';
import { PageLayout } from '@/ui/layout/PageLayout';
import { CourseItem, courseItemEq, fromProject } from '@/ui/pages/courses/components/model';
import { ProjectList } from '@/ui/pages/projects/components/ProjectList';
import { useProjectOpen } from '@/ui/pages/projects/hooks/useProjectOpen';
import { useProjectRemove } from '@/ui/pages/projects/hooks/useProjectRemove';
import { useProjectSync } from '@/ui/pages/projects/hooks/useProjectSync';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';

export function Projects({ clientId, course }: { clientId: ClientId; course: CourseItem }) {
  const { projectRepository } = useGlobalContext();
  const projects = pipe(
    useProperty(projectRepository.projects),
    array.filter((project) => courseItemEq.equals(fromProject(project), course)),
  );
  const openProject = useProjectOpen();
  const syncProject = useProjectSync();
  const removeProject = useProjectRemove();

  useProjectEventUpdate(projectRepository.fetchChanges, clientId);

  return (
    <PageLayout>
      <CourseHeader title={course.name} />
      <ProjectList
        exerciseName={'All exercises'}
        projects={projects}
        onOpen={flow(
          openProject,
          taskEither.fromTaskOption(() => 'Could not open project'),
        )}
        onSync={flow(
          projectRepository.getProject,
          taskEither.fromTaskOption(() => 'Project not found'),
          taskEither.chain(
            flow(
              syncProject,
              taskEither.mapLeft(() => 'Sync error'),
            ),
          ),
          taskEither.map(constVoid),
        )}
        onRemove={removeProject}
      />
    </PageLayout>
  );
}
