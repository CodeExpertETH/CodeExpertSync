import { useProperty } from '@frp-ts/react';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { useGlobalContext } from '@/ui/GlobalContext';
import { ProjectList } from './ProjectList';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';

export function Projects(props: { clientId: ClientId }) {
  const { projectRepository } = useGlobalContext();
  const projects = useProperty(projectRepository.projects);

  useProjectEventUpdate(projectRepository.fetchChanges, props.clientId);

  return <ProjectList projects={projects} updateProjects={projectRepository.fetchChanges} />;
}
