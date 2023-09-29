import { array, either, eq, flow, iots, monoid, pipe, show, string } from '@code-expert/prelude';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

export type PathSegment = iots.Branded<string, PathSegmentBrand>;
export interface PathSegmentBrand {
  readonly PathSegment: unique symbol;
}

export type Path = Array<PathSegment>;

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const eqPathSegment: eq.Eq<PathSegment> = string.Eq;
export const eqPath: eq.Eq<Path> = array.getEq(eqPathSegment);

export const showPath: show.Show<Path> = {
  show: monoid.concatAll(string.join('/')),
};

//----------------------------------------------------------------------------------------------------------------------
// Codecs
//----------------------------------------------------------------------------------------------------------------------

export const PathSegmentC = iots.brandIdentity(
  iots.string,
  (s): s is PathSegment =>
    string.isNotBlank(s) && s !== '.' && s !== '..' && !s.includes('/') && !s.includes('\\'),
  'PathSegment',
);

export const PathC: iots.Type<Path> = iots.array(PathSegmentC);

export const PathFromStringC: iots.Type<Path, string> = new iots.Type(
  'PathFromString',
  (u): u is Path => PathC.is(u),
  (u, c) =>
    pipe(
      u,
      iots.validate(iots.string, c),
      either.chain(
        flow(
          string.split('/'),
          array.unsafeFromReadonly,
          either.traverseArray(iots.validate(PathSegmentC, c)),
        ),
      ),
    ),
  showPath.show,
);

//----------------------------------------------------------------------------------------------------------------------
// Domain functions
//----------------------------------------------------------------------------------------------------------------------

/**
 * Creates a valid path segment from a string.
 */
export const toPathSegment = (s: string): PathSegment =>
  iots.brandFromLiteral(s.replace(/[^a-z0-9_-]/gi, '_'));
