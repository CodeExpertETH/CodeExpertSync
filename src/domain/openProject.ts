import { flow, task, taskEither, taskOption } from '@code-expert/prelude';
import { isoNativePath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { TauriException } from '@/lib/tauri/TauriException';
import { open } from '@/lib/tauri/shell';
import { panic } from '@/utils/error';

export const openProject: (
  projectRepository: ProjectRepository,
) => (projectId: ProjectId) => taskEither.TaskEither<TauriException, void> = (projectRepository) =>
  flow(
    projectRepository.getProjectDir,
    taskOption.getOrElse(() => panic('Tried to open project but root directory is not set')),
    task.map(isoNativePath.unwrap),
    task.chain(open),
  );
