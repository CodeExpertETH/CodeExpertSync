import { property } from '@frp-ts/core';
import { io, task, taskOption } from '@code-expert/prelude';
import { Project, ProjectId } from '@/domain/Project';

export interface ProjectRepository {
  projects: property.Property<Array<Project>>;
  fetchChanges: io.IO<void>;
  getProject(projectId: ProjectId): taskOption.TaskOption<Project>;
  upsertOne(nextProject: Project): task.Task<void>;
}
