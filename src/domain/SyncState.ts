import { tagged } from '@code-expert/prelude';

export type SyncException = string; // FIXME Should be a sum type

export type Changes =
  | tagged.Tagged<'both'>
  | tagged.Tagged<'remote'>
  | tagged.Tagged<'local'>
  | tagged.Tagged<'unknown'>;

export const changesADT = tagged.build<Changes>();

export type SyncState =
  | tagged.Tagged<'syncing'>
  | tagged.Tagged<'error', SyncException>
  | tagged.Tagged<'synced', Changes>;

export const syncStateADT = tagged.build<SyncState>();
