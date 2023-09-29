import { Newtype, iso } from 'newtype-ts';
import { array, either, flow, iots, pipe, show } from '@code-expert/prelude';
import { Semester, SemesterFromStringC } from '@/domain/Semester';
import { Path, PathC, PathFromStringC, showPath, toPathSegment } from './Path';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

/**
 * The base path of a project, i.e. the relative path from the cxsync data directory.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProjectBasePath
  extends Newtype<{ readonly ProjectBasePath: unique symbol }, Path> {}

const isoProjectBasePath = iso<ProjectBasePath>();

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const showProjectBasePath: show.Show<ProjectBasePath> = {
  show: flow(isoProjectBasePath.unwrap, showPath.show),
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
      either.filterOrElse(
        (p) => p.length === 4,
        (): iots.Errors => [{ value: u, context, message: 'Invalid project base path' }],
      ),
      either.map(isoProjectBasePath.wrap),
    ),
  flow(isoProjectBasePath.unwrap, PathFromStringC.encode),
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
  pipe(
    [SemesterFromStringC.encode(semester), courseName, exerciseName, taskName],
    array.map(toPathSegment),
    isoProjectBasePath.wrap,
  );

export const projectBasePathToRelativePath = isoProjectBasePath.unwrap;

/**
 * Converts a path to a project base path without any checks.
 * Caution, only use in tests!
 */
export const unsafeProjectBasePathFromPath = isoProjectBasePath.wrap;
