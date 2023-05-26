import { iots, tagged } from '@code-expert/prelude';
import { ProjectConfig } from '@/domain/ProjectConfig';
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

export type ExtendedProjectMetadata = ProjectMetadata & { syncState: ProjectSyncState };
