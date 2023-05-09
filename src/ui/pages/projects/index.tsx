import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { GuardRemoteData } from '@/ui/components/GuardRemoteData';
import { ProjectList } from './ProjectList';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';
import { useProjects } from './hooks/useProjects';

export function Projects(props: { clientId: ClientId }) {
  const [projectsRD, updateProjects] = useProjects();
  useProjectEventUpdate(() => {
    updateProjects();
  }, props.clientId);

  return (
    <GuardRemoteData
      value={projectsRD}
      render={(projects) => <ProjectList projects={projects} updateProjects={updateProjects} />}
    />
  );
}
