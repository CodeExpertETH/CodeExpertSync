import { nonEmptyArray, ord, pipe, string } from '@code-expert/prelude';
import { Project } from '@/domain/Project';

export interface Exercise {
  name: string;
  projects: NonEmptyArray<Project>;
}

export const exerciseNameOrd = ord.contramap(({ value }: Project) => value.exerciseName)(
  string.OrdLocale,
);

export const projectsByExercise = (projects: NonEmptyArray<Project>): NonEmptyArray<Exercise> =>
  pipe(
    projects,
    nonEmptyArray.groupSort(exerciseNameOrd),
    nonEmptyArray.map((xs) => ({
      name: xs[0].value.exerciseName,
      projects: xs,
    })),
  );
