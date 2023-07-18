import {
  array,
  eq,
  monoid,
  nonEmptyArray,
  option,
  pipe,
  string,
  tagged,
} from '@code-expert/prelude';
import { FileEntryType, File as FileInfo, isFile } from '@/domain/File';

export interface RemoteFileState {
  path: string;
  type: FileEntryType;
  version: number;
}

export const getRemoteChanges = (
  previous: Array<RemoteFileState>,
  latest: Array<RemoteFileState>,
): option.Option<NonEmptyArray<RemoteFileChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<RemoteFileChange> = pipe(
    previousFiles,
    array.difference<RemoteFileState>(eqPath)(latestFiles),
    array.map(({ path }) => ({ path, change: remoteFileChange.removed() })),
  );
  const added: Array<RemoteFileChange> = pipe(
    latestFiles,
    array.difference<RemoteFileState>(eqPath)(previousFiles),
    array.map(({ path, version }) => ({ path, change: remoteFileChange.added(version) })),
  );
  const updated: Array<RemoteFileChange> = pipe(
    previousFiles,
    array.filter((ls) =>
      pipe(
        latestFiles,
        array.findFirst((cs) => cs.path === ls.path),
        option.exists((cs) => cs.version !== ls.version),
      ),
    ),
    array.map(({ path, version }) => ({ path, change: remoteFileChange.updated(version) })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

export interface LocalFileState {
  path: string;
  type: FileEntryType;
  hash: string;
}

export const getLocalChanges = (
  previous: Array<FileInfo>,
  latest: Array<LocalFileState>,
): option.Option<NonEmptyArray<LocalFileChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<LocalFileChange> = pipe(
    previousFiles,
    array.difference<LocalFileState>(eqPath)(latestFiles),
    array.map(({ path }) => ({ path, change: localFileChange.removed() })),
  );
  const added: Array<LocalFileChange> = pipe(
    latestFiles,
    array.difference<LocalFileState>(eqPath)(previousFiles),
    array.map(({ path }) => ({ path, change: localFileChange.added() })),
  );
  const updated: Array<LocalFileChange> = pipe(
    previousFiles,
    array.bindTo('previous'),
    array.bind('latest', ({ previous }) =>
      pipe(
        latestFiles,
        array.findFirst((latest) => eqPath.equals(previous, latest)),
        option.fold(() => [], array.of),
      ),
    ),
    array.filter(({ latest, previous }) => latest.hash !== previous.hash),
    array.map(({ latest: { path } }) => ({
      path,
      change: localFileChange.updated(),
    })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

// -------------------------------------------------------------------------------------------------

export interface RemoteFileChange {
  path: string;
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated', number>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added', number>;
}

export const remoteFileChange = tagged.build<RemoteFileChange['change']>();

export interface LocalFileChange {
  path: string;
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated'>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added'>;
}

export const localFileChange = tagged.build<LocalFileChange['change']>();

export interface Conflict {
  path: string;
  changeRemote: RemoteFileChange['change'];
  changeLocal: LocalFileChange['change'];
}

export const getConflicts = (
  local: NonEmptyArray<LocalFileChange>,
  remote: NonEmptyArray<RemoteFileChange>,
): option.Option<NonEmptyArray<Conflict>> => {
  const conflicts: Array<Conflict> = pipe(
    local,
    array.intersection<LocalFileChange>(eqPath)(remote),
    array.map((changeLocal) => ({
      path: changeLocal.path,
      changeLocal: changeLocal.change,
      changeRemote: pipe(
        remote,
        array.findFirst((changeRemote) => eqPath.equals(changeLocal, changeRemote)),
        option.map(({ change }) => change),
        option.getOrElseW(() => remoteFileChange.noChange()),
      ),
    })),
  );
  return pipe(conflicts, nonEmptyArray.fromArray);
};

// -------------------------------------------------------------------------------------------------

const eqPath = eq.struct({
  path: string.Eq,
});
