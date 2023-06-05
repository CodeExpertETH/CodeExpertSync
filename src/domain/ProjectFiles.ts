import { File } from '@/domain/File';
import { ProjectId } from '@/domain/Project';
import { SyncState } from '@/domain/SyncState';

export interface ProjectFiles {
  projectId: ProjectId;
  basePath: string;
  files: Array<File>;
  syncedAt: Date;
  syncState: SyncState;
}
