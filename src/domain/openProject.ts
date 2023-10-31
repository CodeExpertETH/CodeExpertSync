import { flow, pipe, taskEither } from '@code-expert/prelude';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { LocalProject } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { ShellException, shellExceptionADT } from '@/domain/ShellException';
import { openFileBrowser } from '@/lib/tauri/shell';
import { panic } from '@/utils/error';

export const openProject: (
  stack: Pick<FileSystemStack, 'exists'>,
  projectRepository: ProjectRepository,
) => (project: LocalProject) => taskEither.TaskEither<ShellException, void> = (
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
        shellExceptionADT.noSuchDirectory({ reason: 'Project directory does not exist', path }),
    ),
    taskEither.chainTaskK(({ path }) =>
      pipe(
        openFileBrowser(path),
        taskEither.getOrElse(({ message }) => panic(`Unable to open project: ${message}`)),
      ),
    ),
  );
