import { flow, task, taskEither } from '@code-expert/prelude';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { TauriException } from '@/lib/tauri/TauriException';
import { openFileBrowser } from '@/lib/tauri/shell';

export const openProject: (
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<TauriException, void> = (projectRepository) =>
  flow(projectRepository.getProjectDirPath, task.chain(openFileBrowser));
