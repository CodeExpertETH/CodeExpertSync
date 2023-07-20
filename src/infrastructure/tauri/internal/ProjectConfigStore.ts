import { BaseDirectory, readTextFile, removeFile, writeTextFile } from '@tauri-apps/api/fs';
import { flow, iots, option, pipe, task, taskOption } from '@code-expert/prelude';
import { FileInfoC } from '@/domain/FileSystem';
import { LocalProject, ProjectId } from '@/domain/Project';

const ProjectConfigC = iots.strict({
  basePath: iots.string,
  files: iots.array(FileInfoC),
  syncedAt: iots.DateFromISOString,
});

export type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

export const projectConfigStore = {
  read: (projectId: ProjectId): taskOption.TaskOption<ProjectConfig> =>
    pipe(
      taskOption.tryCatch(
        pipe(
          () => readTextFile(getFileName(projectId), { dir: BaseDirectory.AppLocalData }),
          task.map(JSON.parse),
        ),
      ),
      taskOption.chainOptionK(flow(ProjectConfigC.decode, option.fromEither)),
    ),

  write:
    ({ value }: LocalProject): task.Task<void> =>
    () =>
      writeTextFile(getFileName(value.projectId), JSON.stringify(ProjectConfigC.encode(value)), {
        dir: BaseDirectory.AppLocalData,
      }),

  remove:
    (projectId: ProjectId): task.Task<void> =>
    () =>
      removeFile(getFileName(projectId), {
        dir: BaseDirectory.AppLocalData,
      }),
};

// -------------------------------------------------------------------------------------------------

const getFileName = (projectId: ProjectId): string => `project_${projectId}.json`;
