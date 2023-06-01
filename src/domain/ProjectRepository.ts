import { property } from '@frp-ts/core';
import { io } from '@code-expert/prelude';
import { Project } from '@/domain/Project';

export interface ProjectRepository {
  projects: property.Property<Array<Project>>;
  fetchChanges: io.IO<void>;
}
