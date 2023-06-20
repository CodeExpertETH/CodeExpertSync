import { atom, property } from '@frp-ts/core';
import {
  array,
  constVoid,
  constant,
  io,
  ioOption,
  option,
  pipe,
  task,
  taskEither,
} from '@code-expert/prelude';
import { Project } from '@/domain/Project';
import { ProjectRepository } from '@/domain/ProjectRepository';

export const mkProjectRepositoryTesting = (initial: Array<Project>): ProjectRepository => {
  const projectsDb = atom.newAtom<Array<Project>>(initial);
  return {
    projects: property.newProperty<Array<Project>>(projectsDb.get, projectsDb.subscribe),
    fetchChanges: constVoid,
    getProject: (projectId) =>
      task.fromIO(() =>
        pipe(
          projectsDb.get(),
          array.findFirst((x) => x.value.projectId === projectId),
        ),
      ),
    removeProject: (projectId) =>
      pipe(
        projectsDb.get,
        io.map((projects) =>
          pipe(
            projects,
            array.filter((x) => x.value.projectId === projectId),
            projectsDb.set,
          ),
        ),
        taskEither.fromIO,
        taskEither.map(constVoid),
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
        ioOption.chainIOK((projects) => () => projectsDb.set(projects)),
      );

      return pipe(task.fromIO(updateDb), task.map(constVoid));
    },
  };
};
