import { PersistedFileInfo, ProjectBasePath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { SyncState } from '@/domain/SyncState';

export interface ProjectFiles {
  projectId: ProjectId;
  basePath: ProjectBasePath;
  files: Array<PersistedFileInfo>;
  syncedAt: Date;
  syncState: SyncState;
}
