import { tagged } from '@code-expert/prelude';
import { SyncException } from '@/domain/SyncException';

export type Changes =
  | tagged.Tagged<'both'>
  | tagged.Tagged<'remote'>
  | tagged.Tagged<'local'>
  | tagged.Tagged<'unknown'>;

export const changesADT = tagged.build<Changes>();

export type SyncState =
  | tagged.Tagged<'exception', SyncException>
  | tagged.Tagged<'synced', Changes>;

export const syncStateADT = tagged.build<SyncState>();
