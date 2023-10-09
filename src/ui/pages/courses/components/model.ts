import { eq, fn, nonEmptyArray, option, ord, pipe, string } from '@code-expert/prelude';
import { Project } from '@/domain/Project';
import { Semester, SemesterFromStringC, eqSemester, ordSemesterIdAsc } from '@/domain/Semester';

export interface CourseItem {
  semester: Semester;
  name: string;
}

interface CourseRow {
  semester: Semester;
  courses: NonEmptyArray<CourseItem>;
}

export const courseItemEq = eq.struct<CourseItem>({ semester: eqSemester, name: string.Eq });

export const fromProject = ({ value }: Project): CourseItem => ({
  semester: value.semester,
  name: value.courseName,
});

export const courseItemKey = (course: CourseItem) =>
  `${SemesterFromStringC.encode(course.semester)}-${course.name}`;

const courseItemSemesterOrd = ord.contramap(({ semester }: CourseItem) => semester)(
  ordSemesterIdAsc,
);

const courseItemNameOrd = ord.contramap(({ name }: CourseItem) => name)(string.OrdLocale);

export const coursesBySemester = (courses: NonEmptyArray<CourseItem>): NonEmptyArray<CourseRow> =>
  pipe(
    courses,
    nonEmptyArray.groupSort(courseItemSemesterOrd),
    nonEmptyArray.map((xs) => ({
      semester: xs[0].semester,
      courses: pipe(xs, nonEmptyArray.sort(courseItemNameOrd)),
    })),
  );

const projectCourseNameOrd = ord.reverse(
  ord.contramap(({ value }: Project) => fn.tuple(value.semester, value.courseName))(
    ord.tuple(ordSemesterIdAsc, string.Ord),
  ),
);

export const coursesFromProjects = (projects: Array<Project>): Array<CourseItem> =>
  pipe(
    nonEmptyArray.fromArray(projects),
    option.map((nonEmptyProjects) =>
      pipe(
        nonEmptyProjects,
        nonEmptyArray.groupSort(projectCourseNameOrd),
        nonEmptyArray.map((xs) => fromProject(xs[0])),
      ),
    ),
    option.getOrElse<Array<CourseItem>>(() => []),
  );
