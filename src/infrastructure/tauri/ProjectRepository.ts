import { atom, property } from '@frp-ts/core';
import { api } from 'api';
import {
  array,
  constVoid,
  constant,
  either,
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
import { Project, ProjectId, projectADT, projectPrism } from '@/domain/Project';
import { ProjectFiles } from '@/domain/ProjectFiles';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { fromError } from '@/domain/exception';
import { path } from '@/lib/tauri';
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

  const getProject = (projectId: ProjectId): taskOption.TaskOption<Project> =>
    task.fromIO(() =>
      pipe(
        projectsDb.get(),
        array.findFirst((x) => x.value.projectId === projectId),
      ),
    );

  const removeProjectAccess = (projectId: ProjectId) =>
    createSignedAPIRequest({
      path: 'app/projectAccess/remove',
      method: 'POST',
      jwtPayload: { projectId },
      codec: iots.strict({ removed: iots.boolean }),
    });

  return pipe(
    readProjects,
    task.chainFirstIOK(setProjects),
    task.map(() => ({
      projects: property.newProperty<Array<Project>>(projectsDb.get, projectsDb.subscribe),

      fetchChanges: () => {
        void pipe(
          createSignedAPIRequest({
            path: 'project/metadata',
            method: 'GET',
            jwtPayload: {},
            codec: iots.array(ProjectMetadata),
          }),
          taskEither.chainFirstTaskK(persistMetadata),
          taskEither.chainTaskK(projectsFromMetadata),
          taskEither.chainFirstIOK(setProjects), // FIXME This overwrites existing sync state
          task.map(flow(either.getOrThrow(fromError), constVoid)), // FIXME Don't throw network errors
          task.run,
        );
      },

      getProject,

      removeProject: (projectId) =>
        pipe(
          taskOption.sequenceS({
            rootDir: api.settingRead('projectDir', iots.string),
            project: pipe(
              getProject(projectId),
              taskOption.chainOptionK(projectPrism.local.getOption),
            ),
          }),
          taskOption.chain(({ rootDir, project }) =>
            taskOption.fromTaskEither(path.join(rootDir, project.value.basePath)),
          ),
          taskOption.fold(() => taskEither.right(undefined), api.removeDir),

          // delete in remote
          taskEither.chainFirstTaskK(() => removeProjectAccess(projectId)),
          // todo delete in repo
        ),

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
