import { array, nonEmptyArray, option, pipe } from '@code-expert/prelude';
import { LocalNodeChange, RemoteNodeChange, remoteNodeChange } from './Change';
import { eqFsNodeInfo } from './FsNodeInfo';

export interface Conflict {
  path: string;
  changeRemote: RemoteNodeChange['change'];
  changeLocal: LocalNodeChange['change'];
}

export const getConflicts = (
  local: NonEmptyArray<LocalNodeChange>,
  remote: NonEmptyArray<RemoteNodeChange>,
): option.Option<NonEmptyArray<Conflict>> =>
  pipe(
    local,
    array.intersection<LocalNodeChange>(eqFsNodeInfo)(remote),
    array.map((changeLocal) => ({
      path: changeLocal.path,
      changeLocal: changeLocal.change,
      changeRemote: pipe(
        remote,
        array.findFirst((changeRemote) => eqFsNodeInfo.equals(changeLocal, changeRemote)),
        option.map(({ change }) => change),
        option.getOrElseW(() => remoteNodeChange.noChange()),
      ),
    })),
    nonEmptyArray.fromArray,
  );
