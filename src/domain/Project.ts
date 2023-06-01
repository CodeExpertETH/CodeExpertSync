import { iots, pipe, tagged, task, taskOption } from '@code-expert/prelude';
import { ProjectConfig, readProjectConfig } from '@/domain/ProjectConfig';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { SyncState, changesADT, syncStateADT } from '@/domain/SyncState';
import { mkEntityIdCodec } from '@/utils/identity';

export const ProjectIdBrand = Symbol('ProjectId');
export const ProjectId = mkEntityIdCodec(ProjectIdBrand);
export type ProjectId = iots.TypeOf<typeof ProjectId>;

export type RemoteProject = tagged.Tagged<'remote', ProjectMetadata>;

export type LocalProject = tagged.Tagged<
  'local',
  ProjectMetadata & ProjectConfig & { syncState: SyncState }
>;

export type Project = RemoteProject | LocalProject;

export const projectADT = tagged.build<Project>();

export const projectPrism = tagged.prisms<Project>();

// -------------------------------------------------------------------------------------------------

export const projectFromMetadata = (metadata: ProjectMetadata): task.Task<Project> =>
  pipe(
    readProjectConfig(metadata.projectId),
    taskOption.matchW(
      () => projectADT.remote(metadata),
      (config) =>
        projectADT.local({
          ...metadata,
          ...config,
          syncState: syncStateADT.synced(changesADT.unknown()),
        }),
    ),
  );
