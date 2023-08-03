import { array, monoid, nonEmptyArray, option, pipe, tagged } from '@code-expert/prelude';
import { eqFsNode, isFile } from '@/lib/tauri/fs';
import { FsDir, FsFile } from './FsNode';
import { LocalFileInfo } from './LocalFileInfo';
import { RemoteFileInfo, RemoteNodeInfo } from './RemoteNodeInfo';

export type RemoteChangeType =
  | tagged.Tagged<'noChange'>
  | tagged.Tagged<'updated', number>
  | tagged.Tagged<'removed'>
  | tagged.Tagged<'added', number>;

export const remoteChangeType = tagged.build<RemoteChangeType>();

export type LocalChangeType =
  | tagged.Tagged<'noChange'>
  | tagged.Tagged<'updated'>
  | tagged.Tagged<'removed'>
  | tagged.Tagged<'added'>;

export const localChangeType = tagged.build<LocalChangeType>();

export interface RemoteDirChange extends FsDir {
  change: RemoteChangeType;
}

export interface RemoteFileChange extends FsFile {
  change: RemoteChangeType;
}

export type RemoteNodeChange = RemoteDirChange | RemoteFileChange;

export interface LocalDirChange extends FsDir {
  change: LocalChangeType;
}

export interface LocalFileChange extends FsFile {
  change: LocalChangeType;
}

export type LocalNodeChange = LocalDirChange | LocalFileChange;

// -------------------------------------------------------------------------------------------------

export const getRemoteChanges = (
  previous: Array<RemoteFileInfo>,
  latest: Array<RemoteNodeInfo>,
): option.Option<NonEmptyArray<RemoteFileChange>> => {
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<RemoteFileChange> = pipe(
    previous,
    array.difference<RemoteFileInfo>(eqFsNode)(latestFiles),
    array.map(({ type, path }) => ({ type, path, change: remoteChangeType.removed() })),
  );
  const added: Array<RemoteFileChange> = pipe(
    latestFiles,
    array.difference<RemoteFileInfo>(eqFsNode)(previous),
    array.map(({ type, path, version }) => ({
      type,
      path,
      change: remoteChangeType.added(version),
    })),
  );
  const updated: Array<RemoteFileChange> = pipe(
    previous,
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
      change: remoteChangeType.updated(version),
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
    array.difference<LocalFileInfo>(eqFsNode)(latestFiles),
    array.map(({ type, path }) => ({ type, path, change: localChangeType.removed() })),
  );
  const added: Array<LocalFileChange> = pipe(
    latestFiles,
    array.difference<LocalFileInfo>(eqFsNode)(previousFiles),
    array.map(({ type, path }) => ({ type, path, change: localChangeType.added() })),
  );
  const updated: Array<LocalFileChange> = pipe(
    previousFiles,
    array.bindTo('previous'),
    array.bind('latest', ({ previous }) =>
      pipe(
        latestFiles,
        array.findFirst((latest) => eqFsNode.equals(previous, latest)),
        option.fold(() => [], array.of),
      ),
    ),
    array.filter(({ latest, previous }) => latest.hash !== previous.hash),
    array.map(({ latest: { type, path } }) => ({
      type,
      path,
      change: localChangeType.updated(),
    })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};
