import { array, monoid, nonEmptyArray, option, pipe, tagged } from '@code-expert/prelude';
import { FsDir, FsFile, isFile } from '@/lib/tauri/fs';
import { LocalFileInfo, eqLocalNodeInfo } from './LocalNodeInfo';
import { RemoteNodeInfo } from './RemoteNodeInfo';

export interface RemoteDirChange extends FsDir {
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated', number>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added', number>;
}

export interface RemoteFileChange extends FsFile {
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated', number>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added', number>;
}

export type RemoteNodeChange = RemoteDirChange | RemoteFileChange;

export const remoteNodeChange = tagged.build<RemoteNodeChange['change']>();

export interface LocalDirChange extends FsDir {
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated'>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added'>;
}

export interface LocalFileChange extends FsFile {
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated'>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added'>;
}

export type LocalNodeChange = LocalDirChange | LocalFileChange;

export const localNodeChange = tagged.build<LocalNodeChange['change']>();

// -------------------------------------------------------------------------------------------------

export const getRemoteChanges = (
  previous: Array<RemoteNodeInfo>,
  latest: Array<RemoteNodeInfo>,
): option.Option<NonEmptyArray<RemoteNodeChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<RemoteNodeChange> = pipe(
    previousFiles,
    array.difference<RemoteNodeInfo>(eqLocalNodeInfo)(latestFiles),
    array.map(({ type, path }) => ({ type, path, change: remoteNodeChange.removed() })),
  );
  const added: Array<RemoteNodeChange> = pipe(
    latestFiles,
    array.difference<RemoteNodeInfo>(eqLocalNodeInfo)(previousFiles),
    array.map(({ type, path, version }) => ({
      type,
      path,
      change: remoteNodeChange.added(version),
    })),
  );
  const updated: Array<RemoteNodeChange> = pipe(
    previousFiles,
    array.filter((ls) =>
      pipe(
        latestFiles,
        array.findFirst((cs) => cs.path === ls.path),
        option.exists((cs) => cs.version !== ls.version),
      ),
    ),
    array.map(({ type, path, version }) => ({
      type,
      path,
      change: remoteNodeChange.updated(version),
    })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

export const getLocalChanges = (
  previous: Array<LocalFileInfo>,
  latest: Array<LocalFileInfo>,
): option.Option<NonEmptyArray<LocalFileChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<LocalFileChange> = pipe(
    previousFiles,
    array.difference<LocalFileInfo>(eqLocalNodeInfo)(latestFiles),
    array.map(({ type, path }) => ({ type, path, change: localNodeChange.removed() })),
  );
  const added: Array<LocalFileChange> = pipe(
    latestFiles,
    array.difference<LocalFileInfo>(eqLocalNodeInfo)(previousFiles),
    array.map(({ type, path }) => ({ type, path, change: localNodeChange.added() })),
  );
  const updated: Array<LocalFileChange> = pipe(
    previousFiles,
    array.bindTo('previous'),
    array.bind('latest', ({ previous }) =>
      pipe(
        latestFiles,
        array.findFirst((latest) => eqLocalNodeInfo.equals(previous, latest)),
        option.fold(() => [], array.of),
      ),
    ),
    array.filter(({ latest, previous }) => latest.hash !== previous.hash),
    array.map(({ latest: { type, path } }) => ({
      type,
      path,
      change: localNodeChange.updated(),
    })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};
