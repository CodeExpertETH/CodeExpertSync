import React from 'react';
import { fileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { openProject } from '@/domain/openProject';
import { useGlobalContext } from '@/ui/GlobalContext';

export const useProjectOpen = () => {
  const { projectRepository } = useGlobalContext();
  return React.useMemo(() => openProject(fileSystemStack, projectRepository), [projectRepository]);
};
