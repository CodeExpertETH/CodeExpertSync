import { PersistedFileInfo, RelativeProjectPath } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { SyncState } from '@/domain/SyncState';

export interface ProjectFiles {
  projectId: ProjectId;
  basePath: RelativeProjectPath;
  files: Array<PersistedFileInfo>;
  syncedAt: Date;
  syncState: SyncState;
}
