import { Store as TauriStore } from 'tauri-plugin-store-api';
import { constVoid, flow, iots, option, pipe, task, taskOption } from '@code-expert/prelude';
import { ProjectId } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';

const store = new TauriStore('project_metadata.json');

const addToStore = (project: ProjectMetadata) =>
  taskOption.tryCatch(() => store.set(project.projectId, ProjectMetadata.encode(project)));

const persistStore = taskOption.tryCatch(() => store.save());

export const projectMetadataStore = {
  find: (projectId: ProjectId): taskOption.TaskOption<ProjectMetadata> =>
    pipe(
      taskOption.tryCatch(() => store.get(projectId)),
      taskOption.chainOptionK(flow(ProjectMetadata.decode, option.fromEither)),
    ),
  findAll: (): taskOption.TaskOption<Array<ProjectMetadata>> =>
    pipe(
      taskOption.tryCatch(() => store.values()),
      taskOption.chainOptionK(iots.parseOption(iots.array(ProjectMetadata))),
    ),
  write: (metadata: ProjectMetadata): taskOption.TaskOption<void> =>
    pipe(
      addToStore(metadata),
      taskOption.chainFirstTaskK(() => persistStore),
    ),
  remove: (projectId: ProjectId): task.Task<void> =>
    pipe(
      taskOption.tryCatch(() => store.delete(projectId)),
      taskOption.chainFirst(() => persistStore),
      task.map(constVoid),
    ),
  writeAll: (projects: Array<ProjectMetadata>): taskOption.TaskOption<void> =>
    pipe(
      projects,
      taskOption.traverseArray(addToStore),
      taskOption.chainFirst(() => persistStore),
      taskOption.map(constVoid),
    ),
};
