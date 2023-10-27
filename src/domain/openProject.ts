import { flow, pipe, task, taskEither } from '@code-expert/prelude';
import { OpenException, openExceptionADT } from '@/domain/OpenException';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { openFileBrowser } from '@/lib/tauri/shell';

export const openProject: (
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<OpenException, void> = (projectRepository) =>
  flow(
    projectRepository.getProjectDirPath,
    task.chain((path) =>
      pipe(
        openFileBrowser(path),
        taskEither.mapLeft(({ message }) =>
          openExceptionADT.noSuchDirectory({ reason: message, path }),
        ),
      ),
    ),
  );
