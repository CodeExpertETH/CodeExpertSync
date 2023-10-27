import { property } from '@frp-ts/core';
import { io, option, task } from '@code-expert/prelude';
import { NativePath } from '@/domain/FileSystem';
import { LocalProject, Project, ProjectId } from '@/domain/Project';

export interface ProjectRepository {
  projects: property.Property<Array<Project>>;
  fetchChanges: io.IO<void>;
  getProject: (projectId: ProjectId) => option.Option<Project>;
  getProjectDirPath: (project: LocalProject) => task.Task<NativePath>;
  removeProject: (project: Project) => task.Task<void>;
  upsertOne: (nextProject: Project) => task.Task<void>;
}
