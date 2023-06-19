import { tagged } from '@code-expert/prelude';
import { Project, projectADT } from '@/domain/Project';
import { changesADT, syncStateADT } from '@/domain/SyncState';

export type SyncButtonState =
  | tagged.Tagged<'remote'>
  | tagged.Tagged<'synced', Date>
  | tagged.Tagged<'syncing'>
  | tagged.Tagged<'changesRemote'>
  | tagged.Tagged<'changesLocal'>
  | tagged.Tagged<'changesBoth'>
  | tagged.Tagged<'warning', Date>;

export const syncButtonStateADT = tagged.build<SyncButtonState>();

export const fromProject = (project: Project, isSyncing: boolean): SyncButtonState =>
  isSyncing
    ? syncButtonStateADT.syncing()
    : projectADT.fold(project, {
        remote: syncButtonStateADT.remote,
        local: ({ syncState, syncedAt }) =>
          syncStateADT.fold(syncState, {
            synced: changesADT.fold({
              unknown: () => syncButtonStateADT.wide.synced(syncedAt),
              both: syncButtonStateADT.changesBoth,
              remote: syncButtonStateADT.changesRemote,
              local: syncButtonStateADT.changesLocal,
            }),
            exception: () => syncButtonStateADT.warning(syncedAt),
          }),
      });
