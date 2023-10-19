import { Newtype, iso } from 'newtype-ts';
import {
  array,
  either,
  eq,
  flow,
  iots,
  monoid,
  option,
  pipe,
  show,
  string,
} from '@code-expert/prelude';
import { Path, PathC, eqPath } from './Path';

//----------------------------------------------------------------------------------------------------------------------
// Types
//----------------------------------------------------------------------------------------------------------------------

/**
 * PFS path.
 * An empty path represents the PFS root directory (".").
 *
 * @example
 * const files: Record<NativePath, PfsPath> = {
 *   '.': [],
 *   './foo.py': ['foo.py'],
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PfsPath extends Newtype<{ readonly PfsPath: unique symbol }, Path> {}

const isoPfsPath = iso<PfsPath>();

//----------------------------------------------------------------------------------------------------------------------
// Type class instances
//----------------------------------------------------------------------------------------------------------------------

export const eqPfsPath: eq.Eq<PfsPath> = pipe(eqPath, eq.contramap(isoPfsPath.unwrap));

export const showPfsPath: show.Show<PfsPath> = {
  show: flow(isoPfsPath.unwrap, array.prepend('.'), monoid.concatAll(string.join('/'))),
};

//----------------------------------------------------------------------------------------------------------------------
// Codecs
//----------------------------------------------------------------------------------------------------------------------

export const PfsPathFromStringC: iots.Type<PfsPath, string> = new iots.Type<
  PfsPath,
  string,
  unknown
>(
  'PfsPathFromString',
  (u): u is PfsPath => iots.string.is(u),
  (u, context) =>
    pipe(
      u,
      iots.validate(iots.string, context),
      either.map(string.split('/')),
      either.chain(iots.validate(iots.nonEmptyArray(iots.string), context)),
      either.chain(([head, ...tail]) =>
        pipe(
          option.when(head === '.', () => tail),
          either.fromOption(
            (): iots.Errors => [{ value: u, context, message: 'Invalid PFS path' }],
          ),
          either.chain(iots.validate(PathC, context)),
          either.map(isoPfsPath.wrap),
        ),
      ),
    ),
  showPfsPath.show,
);

//----------------------------------------------------------------------------------------------------------------------
// Domain functions
//----------------------------------------------------------------------------------------------------------------------

export const getPfsParent: (path: PfsPath) => option.Option<PfsPath> = flow(
  isoPfsPath.unwrap,
  array.matchRight(() => option.none, option.some),
  option.map(isoPfsPath.wrap),
);

export const pfsPathFromRelativePath = isoPfsPath.wrap;

export const pfsPathToRelativePath = isoPfsPath.unwrap;

/**
 * Return a PfsPath's basename part, similar to Node's path.basename.
 * Returns None if the path is empty.
 */
export const pfsBasename: (path: PfsPath) => option.Option<string> = flow(
  isoPfsPath.unwrap,
  array.last,
);
