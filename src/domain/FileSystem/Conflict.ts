import { array, nonEmptyArray, option, pipe } from '@code-expert/prelude';
import { PfsPath, eqPfsNode } from '@/domain/FileSystem';
import { LocalNodeChange, RemoteNodeChange, remoteChangeType } from './Change';

export interface Conflict {
  path: PfsPath;
  changeRemote: RemoteNodeChange['change'];
  changeLocal: LocalNodeChange['change'];
}

export const getConflicts = (
  local: NonEmptyArray<LocalNodeChange>,
  remote: NonEmptyArray<RemoteNodeChange>,
): option.Option<NonEmptyArray<Conflict>> =>
  pipe(
    local,
    array.intersection<LocalNodeChange>(eqPfsNode)(remote),
    array.map((changeLocal) => ({
      path: changeLocal.path,
      changeLocal: changeLocal.change,
      changeRemote: pipe(
        remote,
        array.findFirst((changeRemote) => eqPfsNode.equals(changeLocal, changeRemote)),
        option.map(({ change }) => change),
        option.getOrElseW(() => remoteChangeType.noChange()),
      ),
    })),
    nonEmptyArray.fromArray,
  );
