import { either, fn, iots, pipe, show } from '@code-expert/prelude';
import { Semester, SemesterFromStringC } from '@/domain/Semester';
import { Path, PathC, PathFromStringC, PathSegment, PathSegmentC, showPath } from './Path';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

export type ProjectBasePathSegment = iots.Branded<PathSegment, ProjectBasePathSegmentBrand>;
export interface ProjectBasePathSegmentBrand {
  readonly ProjectBasePathSegment: unique symbol;
}
export const ProjectBasePathSegmentC = iots.brandIdentity(
  PathSegmentC,
  (s): s is ProjectBasePathSegment => !PROJECT_BASE_PATH_SEGMENT_REGEX.test(s),
  'ProjectBasePathSegment',
);

/**
 * The base path of a project, i.e. the relative path from the cxsync data directory.
 *
 * @example
 * ["AS23", "GdI", "Exercise_1", "Task_1"]
 */
export type ProjectBasePath = [
  semester: ProjectBasePathSegment,
  course: ProjectBasePathSegment,
  exercise: ProjectBasePathSegment,
  task: ProjectBasePathSegment,
];

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const showProjectBasePath: show.Show<ProjectBasePath> = {
  show: showPath.show,
};

//----------------------------------------------------------------------------------------------------------------------
// Codecs
//----------------------------------------------------------------------------------------------------------------------

export const ProjectBasePathFromStringC: iots.Type<ProjectBasePath, string> = new iots.Type<
  ProjectBasePath,
  string,
  unknown
>(
  'ProjectBasePathFromString',
  (u): u is ProjectBasePath => PathC.is(u),
  (u, context) =>
    pipe(
      u,
      iots.validate(PathFromStringC, context),
      either.chain(iots.validate(iots.array(ProjectBasePathSegmentC), context)),
      either.filterOrElse(
        (p): p is ProjectBasePath => p.length === 4,
        (): iots.Errors => [{ value: u, context, message: 'Invalid project base path' }],
      ),
    ),
  PathFromStringC.encode,
);

//----------------------------------------------------------------------------------------------------------------------
// Domain functions
//----------------------------------------------------------------------------------------------------------------------

export const mkProjectBasePath = (
  semester: Semester,
  courseName: string,
  exerciseName: string,
  taskName: string,
): ProjectBasePath =>
  fn.tuple(
    mkProjectBasePathSegment(SemesterFromStringC.encode(semester)),
    mkProjectBasePathSegment(courseName),
    mkProjectBasePathSegment(exerciseName),
    mkProjectBasePathSegment(taskName),
  );

/**
 * Converts a path to a project base path without any checks.
 * Caution, only use in tests!
 */
export const UNSAFE_ProjectBasePathFromPath = (p: Path) => p as ProjectBasePath;

const PROJECT_BASE_PATH_SEGMENT_REGEX = /[^a-z0-9_-]/gi;
/**
 * Creates a valid path segment from a string.
 */
export const mkProjectBasePathSegment = (s: string): ProjectBasePathSegment =>
  iots.brandFromLiteral(s.replace(PROJECT_BASE_PATH_SEGMENT_REGEX, '_'));
