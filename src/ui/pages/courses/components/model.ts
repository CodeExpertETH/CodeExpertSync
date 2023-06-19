import { nonEmptyArray, option, ord, pipe, string } from '@code-expert/prelude';
import { Project } from '@/domain/Project';
import { ordSemesterIdAsc } from '@/domain/Semester';

export interface CourseItem {
  semester: string;
  name: string;
}

interface CourseRow {
  semester: string;
  courses: NonEmptyArray<CourseItem>;
}

const courseItemSemesterOrd = ord.contramap(({ semester }: CourseItem) => semester)(
  ordSemesterIdAsc,
);

const courseItemNameOrd = ord.contramap(({ name }: CourseItem) => name)(string.OrdLocale);

export const coursesBySemester = (courses: NonEmptyArray<CourseItem>): NonEmptyArray<CourseRow> =>
  pipe(
    courses,
    nonEmptyArray.sort(courseItemSemesterOrd),
    (xs) => xs, // TypeScript selects the Array (instead of NEA) branch here without this circuit breaker ...
    nonEmptyArray.group(courseItemSemesterOrd),
    nonEmptyArray.map((xs) => ({
      semester: xs[0].semester,
      courses: pipe(xs, nonEmptyArray.sort(courseItemNameOrd)),
    })),
  );

const projectCourseNameOrd = ord.contramap(({ value }: Project) => value.courseName)(string.Ord);

export const coursesFromProjects = (projects: Array<Project>): Array<CourseItem> =>
  pipe(
    nonEmptyArray.fromArray(projects),
    option.map((nonEmptyProjects) =>
      pipe(
        nonEmptyProjects,
        nonEmptyArray.group(projectCourseNameOrd),
        nonEmptyArray.map((xs) => ({
          semester: xs[0].value.semester,
          name: xs[0].value.courseName,
        })),
      ),
    ),
    option.getOrElse<Array<CourseItem>>(() => []),
  );
