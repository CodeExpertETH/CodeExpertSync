import { atom, property } from '@frp-ts/core';
import { api } from 'api';
import {
  array,
  constVoid,
  constant,
  flow,
  io,
  ioOption,
  iots,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { NativePath, projectDirToNativePath } from '@/domain/FileSystem';
import { FileSystemStack, fileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import {
  LocalProject,
  Project,
  ProjectId,
  getProjectDir,
  projectADT,
  projectPrism,
} from '@/domain/Project';
import { ProjectFiles } from '@/domain/ProjectFiles';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { apiErrorToMessage, apiGetSigned, apiPostSigned } from '@/utils/api';
import { panic } from '@/utils/error';
import { projectConfigStore } from './internal/ProjectConfigStore';
import { projectMetadataStore } from './internal/ProjectMetadataStore';

const projectsDb = atom.newAtom<Array<Project>>([]);

const retrieveFiles = (projectId: ProjectId): taskOption.TaskOption<ProjectFiles> =>
  pipe(
    projectConfigStore.read(projectId),
    taskOption.map((config) => ({
      ...config,
      projectId,
      syncState: syncStateADT.synced(changesADT.unknown()),
    })),
  );

export const projectFromMetadata = (metadata: ProjectMetadata): task.Task<Project> =>
  pipe(
    retrieveFiles(metadata.projectId),
    taskOption.matchW(
      () => projectADT.remote(metadata),
      (config) => projectADT.local({ ...metadata, ...config }),
    ),
  );

const projectsFromMetadata = (projects: Array<ProjectMetadata>): task.Task<Array<Project>> =>
  pipe(projects, task.traverseArray(projectFromMetadata), task.map(array.unsafeFromReadonly));

export const mkProjectRepositoryTauri = (): task.Task<ProjectRepository> => {
  const stack: FileSystemStack = fileSystemStack;

  const persistMetadata = (metadata: Array<ProjectMetadata>): taskOption.TaskOption<void> =>
    projectMetadataStore.writeAll(metadata);

  const setProjects =
    (projects: Array<Project>): io.IO<void> =>
    () =>
      projectsDb.set(projects);

  const readProjects = pipe(
    projectMetadataStore.findAll(),
    taskOption.getOrElseW(() => task.of([])),
    task.chain(projectsFromMetadata),
  );

  const getProjectDirPath: (project: LocalProject) => task.Task<NativePath> = flow(
    getProjectDir,
    task.chain(projectDirToNativePath(stack)),
  );

  return pipe(
    readProjects,
    task.chainFirstIOK(setProjects),
    task.map(() => ({
      projects: property.newProperty<Array<Project>>(projectsDb.get, projectsDb.subscribe),

      fetchChanges: pipe(
        apiGetSigned({
          path: 'project/metadata',
          codec: iots.array(ProjectMetadata),
        }),
        taskEither.getOrElse((e) => panic(`Failed to fetch changes: ${apiErrorToMessage(e)}`)),
        task.chainFirst(persistMetadata),
        task.chain(projectsFromMetadata),
        task.chainIOK(setProjects), // FIXME This overwrites existing sync state
      ),

      getProject: (projectId) =>
        pipe(
          projectsDb.get(),
          array.findFirst((x) => x.value.projectId === projectId),
        ),

      getProjectDirPath,

      removeProject: (project) => {
        const { projectId } = project.value;

        const removeProjectDir: taskEither.TaskEither<Array<string>, void> = pipe(
          projectPrism.local.getOption(project),
          option.fold(
            constant(taskEither.of(undefined)),
            flow(
              getProjectDirPath,
              task.chain(
                flow(
                  api.removeDir,
                  taskEither.mapLeft((e) => [e.message]),
                ),
              ),
            ),
          ),
        );

        const removeProjectAccess: taskEither.TaskEither<Array<string>, void> = pipe(
          apiPostSigned({
            path: 'projectAccess/remove',
            jwtPayload: { projectId },
            codec: iots.strict({ removed: iots.boolean }),
          }),
          taskEither.mapLeft(flow(apiErrorToMessage, array.of)),
          taskEither.filterOrElse(
            ({ removed }) => removed,
            () => ['Could not remove project access'],
          ),
          taskEither.map(constVoid),
        );

        const removeMetadata: taskEither.TaskEither<Array<string>, void> = pipe(
          projectMetadataStore.remove(projectId),
          taskEither.fromTask,
        );

        const removeConfig: taskEither.TaskEither<Array<string>, void> = pipe(
          projectConfigStore.remove(projectId),
          taskEither.fromTask,
        );

        const removeFromDb: taskEither.TaskEither<Array<string>, void> = pipe(
          () => projectsDb.modify(flow(array.filter(({ value }) => value.projectId !== projectId))),
          taskEither.fromIO,
        );

        const logDebugErrors = (errors: ReadonlyArray<string>): void => {
          console.debug(
            `[removeProject] Not everything could be removed from project ${projectId}. Errors:`,
            errors,
          );
        };

        return pipe(
          taskEither.sequenceArrayValidation([
            removeProjectDir,
            removeProjectAccess,
            removeMetadata,
            removeConfig,
            removeFromDb,
          ]),
          taskEither.match(logDebugErrors, constVoid),
        );
      },

      upsertOne: (nextProject) => {
        const updateDb: ioOption.IOOption<void> = pipe(
          projectsDb.get,
          io.map((projects) =>
            pipe(
              projects,
              array.findIndex((x) => x.value.projectId === nextProject.value.projectId),
              option.chain((index) => pipe(projects, array.modifyAt(index, constant(nextProject)))),
            ),
          ),
          ioOption.chainIOK(setProjects),
        );

        const updateCaches: taskOption.TaskOption<void> = pipe(
          task.fromIO(() => projectPrism.local.getOption(nextProject)),
          taskOption.chainFirstTaskK(({ value }) => projectMetadataStore.write(value)),
          taskOption.chainFirstTaskK(projectConfigStore.write),
          taskOption.map(constVoid),
        );

        return pipe(
          task.fromIO(updateDb),
          taskOption.chainFirst(() => updateCaches),
          task.map(constVoid),
        );
      },
    })),
  );
};
