import { property } from '@frp-ts/core';
import { io, task, taskEither, taskOption } from '@code-expert/prelude';
import { Project, ProjectId } from '@/domain/Project';
import { Exception } from '@/domain/exception';

export interface ProjectRepository {
  projects: property.Property<Array<Project>>;
  fetchChanges: io.IO<void>;
  getProject(projectId: ProjectId): taskOption.TaskOption<Project>;
  removeProject(projectId: ProjectId): taskEither.TaskEither<Exception, void>;
  upsertOne(nextProject: Project): task.Task<void>;
}
