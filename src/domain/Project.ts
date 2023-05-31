import { iots, tagged } from '@code-expert/prelude';
import { ProjectConfig } from '@/domain/ProjectConfig';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { mkEntityIdCodec } from '@/utils/identity';

export const ProjectIdBrand = Symbol('ProjectId');
export const ProjectId = mkEntityIdCodec(ProjectIdBrand);
export type ProjectId = iots.TypeOf<typeof ProjectId>;

export type NotSynced = tagged.Tagged<'notSynced'>;
export type Synced = tagged.Tagged<'synced', ProjectConfig>;
export type ProjectSyncState = NotSynced | Synced;

export const projectSyncState = tagged.build<ProjectSyncState>();

export const projectSyncStatePrism = tagged.prisms<ProjectSyncState>();

export interface Project extends ProjectMetadata {
  syncState: ProjectSyncState;
}
