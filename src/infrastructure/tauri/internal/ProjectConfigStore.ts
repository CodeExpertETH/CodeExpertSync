import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { flow, iots, option, pipe, task, taskOption } from '@code-expert/prelude';
import { FileC } from '@/domain/File';
import { LocalProject, ProjectId } from '@/domain/Project';

const ProjectConfigC = iots.strict({
  basePath: iots.string,
  files: iots.array(FileC),
  syncedAt: iots.DateFromISOString,
});

export type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

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
