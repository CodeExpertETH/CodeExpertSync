import { FileInfo } from '@/domain/FileSystem';
import { ProjectId } from '@/domain/Project';
import { SyncState } from '@/domain/SyncState';

export interface ProjectFiles {
  projectId: ProjectId;
  basePath: string;
  files: Array<FileInfo>;
  syncedAt: Date;
  syncState: SyncState;
}
