import { iots, tagged } from '@code-expert/prelude';

import { mkEntityIdCodec } from '../utils/identity';

export const ProjectIdBrand = Symbol('ProjectId');
export const ProjectId = mkEntityIdCodec(ProjectIdBrand);
export type ProjectId = iots.TypeOf<typeof ProjectId>;

export type ProjectSyncState =
  | tagged.Tagged<'notSynced'>
  | tagged.Tagged<'synced', { dir: string }>;

export const projectSyncState = tagged.build<ProjectSyncState>();

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
