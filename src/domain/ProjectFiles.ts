import { File } from '@/domain/File';
import { ProjectId } from '@/domain/Project';
import { SyncState } from '@/domain/SyncState';

export interface ProjectFiles {
  projectId: ProjectId;
  dir: string; // TODO Suggestion to rename to "basePath"
  files: Array<File>;
  syncedAt: Date;
  syncState: SyncState;
}
