import { api } from 'api';
import { iots, pipe, tagged, taskEither } from '@code-expert/prelude';
import { Exception } from '@/domain/exception';
import { mkEntityIdCodec } from '@/utils/identity';

export const ProjectIdBrand = Symbol('ProjectId');
export const ProjectId = mkEntityIdCodec(ProjectIdBrand);
export type ProjectId = iots.TypeOf<typeof ProjectId>;

export type NotSynced = tagged.Tagged<'notSynced'>;
export type Synced = tagged.Tagged<'synced', ProjectConfig>;
export type ProjectSyncState = NotSynced | Synced;

export const projectSyncState = tagged.build<ProjectSyncState>();

export const projectSyncStatePrism = tagged.prisms<ProjectSyncState>();

export const ProjectMetadata = iots.strict({
  projectId: ProjectId,
  exerciseName: iots.string,
  projectName: iots.string,
  taskName: iots.string,
  courseName: iots.string,
  semester: iots.string,
});

export type ProjectMetadata = iots.TypeOf<typeof ProjectMetadata>;

export const FilePermissionsC = iots.keyof({ r: null, rw: null });
export type FilePermissions = iots.TypeOf<typeof FilePermissionsC>;

export const FileEntryTypeC = iots.keyof({ file: null, dir: null });
export type FileEntryType = iots.TypeOf<typeof FileEntryTypeC>;

export const ProjectConfigC = iots.strict({
  dir: iots.string,
  files: iots.array(
    iots.strict({
      path: iots.string,
      version: iots.number,
      hash: iots.string,
      type: FileEntryTypeC,
      permissions: FilePermissionsC,
    }),
  ),
  syncedAt: iots.DateFromISOString,
});
export type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

export type ExtendedProjectMetadata = ProjectMetadata & { syncState: ProjectSyncState };
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
