import React from 'react';
import { openProject } from '@/domain/openProject';
import { useGlobalContext } from '@/ui/GlobalContext';

export const useProjectOpen = () => {
  const { projectRepository } = useGlobalContext();
  return React.useMemo(() => openProject(projectRepository), [projectRepository]);
};
