import { flow, pipe, taskEither } from '@code-expert/prelude';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { OpenException, openExceptionADT } from '@/domain/OpenException';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { openFileBrowser } from '@/lib/tauri/shell';
import { panic } from '@/utils/error';

export const openProject: (
  stack: Pick<FileSystemStack, 'exists'>,
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<OpenException, void> = (
  stack,
  projectRepository,
) =>
  flow(
    taskEither.of,
    taskEither.bindTo('project'),
    taskEither.bindTaskK('path', ({ project }) => projectRepository.getProjectDirPath(project)),
    taskEither.bindTaskK('exists', ({ path }) => stack.exists(path)),
    taskEither.filterOrElse(
      ({ exists }) => exists,
      ({ path }) =>
        openExceptionADT.noSuchDirectory({ reason: 'Project directory does not exist', path }),
    ),
    taskEither.chainTaskK(({ path }) =>
      pipe(
        openFileBrowser(path),
        taskEither.getOrElse(({ message }) => panic(`Unable to open project: ${message}`)),
      ),
    ),
  );
