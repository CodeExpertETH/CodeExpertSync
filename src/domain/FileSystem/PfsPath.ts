import { Newtype, iso } from 'newtype-ts';
import {
  array,
  either,
  eq,
  flow,
  iots,
  monoid,
  nonEmptyArray,
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
      either.chain(
        nonEmptyArray.matchLeft((head, tail) =>
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
