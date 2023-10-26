import { flow, pipe, task, taskEither } from '@code-expert/prelude';
import { OpenException, mkOpenException } from '@/domain/OpenException';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { openFileBrowser } from '@/lib/tauri/shell';

export const openProject: (
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<OpenException, void> = (projectRepository) =>
  flow(
    projectRepository.getProjectDirPath,
    task.chain((projectPath) =>
      pipe(
        openFileBrowser(projectPath),
        taskEither.mapLeft(({ message }) => mkOpenException(message, projectPath)),
      ),
    ),
  );
