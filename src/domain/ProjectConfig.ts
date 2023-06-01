import { api } from 'api';
import { iots, pipe, taskEither } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';
import { Exception } from '@/domain/exception';

export const FilePermissionsC = iots.keyof({ r: null, rw: null });
export type FilePermissions = iots.TypeOf<typeof FilePermissionsC>;

export const FileEntryTypeC = iots.keyof({ file: null, dir: null });
export type FileEntryType = iots.TypeOf<typeof FileEntryTypeC>;

export const FileC = iots.strict({
  path: iots.string,
  version: iots.number,
  hash: iots.string,
  type: FileEntryTypeC,
  permissions: FilePermissionsC,
});
export type File = iots.TypeOf<typeof FileC>;

export const ProjectConfigC = iots.strict({
  dir: iots.string,
  files: iots.array(FileC),
  syncedAt: iots.DateFromISOString,
});
export type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

export class ProjectVerifyException extends Error {
  declare error: 'ProjectVerifyException';

  declare reason: string;

  constructor(message: string) {
    super(message);
  }
}

export const verifyProjectExistsLocal = (
  projectConfig: ProjectConfig,
): taskEither.TaskEither<ProjectVerifyException | Exception, void> => {
  const { dir } = projectConfig;
  return pipe(
    taskEither.fromTask(api.exists(dir)),
    taskEither.chainW((doesExists) => {
      if (!doesExists) {
        return taskEither.left(
          new ProjectVerifyException(`Project directory "${dir}" does not exist.`),
        );
      }
      return taskEither.right(undefined);
    }),
  );
};

export const readProjectConfig = (projectId: ProjectId) =>
  api.readConfigFile(`project_${projectId}.json`, ProjectConfigC);

export const writeProjectConfig = (projectId: ProjectId, projectConfig: Readonly<ProjectConfig>) =>
  api.writeConfigFile(`project_${projectId}.json`, ProjectConfigC.encode(projectConfig));
