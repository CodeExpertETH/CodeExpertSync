import { useProperty } from '@frp-ts/react';
import React from 'react';
import { constVoid, flow, taskEither } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { useGlobalContext } from '@/ui/GlobalContext';
import { CourseHeader } from '@/ui/components/CourseHeader';
import { PageLayout } from '@/ui/layout/PageLayout';
import { ProjectList } from '@/ui/pages/projects/components/ProjectList';
import { useProjectOpen } from '@/ui/pages/projects/hooks/useProjectOpen';
import { useProjectRemove } from '@/ui/pages/projects/hooks/useProjectRemove';
import { useProjectSync } from '@/ui/pages/projects/hooks/useProjectSync';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';

export function Projects(props: { clientId: ClientId }) {
  const { projectRepository } = useGlobalContext();
  const projects = useProperty(projectRepository.projects);
  const openProject = useProjectOpen();
  const syncProject = useProjectSync();
  const removeProject = useProjectRemove();

  useProjectEventUpdate(projectRepository.fetchChanges, props.clientId);

  return (
    <PageLayout>
      <CourseHeader title={'All courses'} url={'https://expert.ethz.ch'} />
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
