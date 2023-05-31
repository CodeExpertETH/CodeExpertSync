import { atom, property } from '@frp-ts/core';
import { api } from 'api';
import {
  array,
  constVoid,
  either,
  flow,
  io,
  iots,
  pipe,
  task,
  taskEither,
  taskOption,
} from '@code-expert/prelude';
import { Project, projectFromMetadata } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { fromError } from '@/domain/exception';

const projectsDb = atom.newAtom<Array<Project>>([]);

const projectsFromMetadata = (projects: Array<ProjectMetadata>): task.Task<Array<Project>> =>
  pipe(projects, task.traverseArray(projectFromMetadata), task.map(array.unsafeFromReadonly));

export const mkProjectRepositoryTauri = (): task.Task<ProjectRepository> => {
  const persistMetadata = (metadata: Array<ProjectMetadata>): taskOption.TaskOption<void> =>
    api.settingWrite('projects', metadata);

  const setProjects =
    (projects: Array<Project>): io.IO<void> =>
    () =>
      projectsDb.set(projects);

  const readProjects = pipe(
    api.settingRead('projects', iots.array(ProjectMetadata)),
    taskOption.getOrElseW(() => task.of([])),
    task.chain(projectsFromMetadata),
  );

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
            payload: {},
            codec: iots.array(ProjectMetadata),
          }),
          taskEither.chainFirstTaskK(persistMetadata),
          taskEither.chainTaskK(projectsFromMetadata),
          taskEither.chainFirstIOK(setProjects),
          task.map(flow(either.getOrThrow(fromError), constVoid)), // FIXME Don't throw network errors
        );
      },
    })),
  );
};
