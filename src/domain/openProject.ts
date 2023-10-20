import { flow, pipe, task, taskEither } from '@code-expert/prelude';
import {
  OpenProjectException,
  mkOpenProjectException,
} from '@/domain/FileSystem/OpenProjectException';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { openFileBrowser } from '@/lib/tauri/shell';

export const openProject: (
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<OpenProjectException, void> = (
  projectRepository,
) =>
  flow(
    projectRepository.getProjectDirPath,
    task.chain((projectPath) =>
      pipe(
        openFileBrowser(projectPath),
        taskEither.mapLeft(({ message }) => mkOpenProjectException(message, projectPath)),
      ),
    ),
  );
