import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { flow, option, pipe, task, taskOption } from '@code-expert/prelude';
import { LocalProject, ProjectId } from '@/domain/Project';
import { ProjectConfig, ProjectConfigC } from '@/domain/ProjectConfig';

export const projectConfigStore = {
  read: (projectId: ProjectId): taskOption.TaskOption<ProjectConfig> =>
    pipe(
      taskOption.tryCatch(
        pipe(
          () => readTextFile(`project_${projectId}.json`, { dir: BaseDirectory.AppLocalData }),
          task.map(JSON.parse),
        ),
      ),
      taskOption.chainOptionK(flow(ProjectConfigC.decode, option.fromEither)),
    ),
  write:
    ({ value }: LocalProject): task.Task<void> =>
    () =>
      writeTextFile(
        `project_${value.projectId}.json`,
        JSON.stringify(ProjectConfigC.encode(value)),
        {
          dir: BaseDirectory.AppLocalData,
        },
      ),
};
