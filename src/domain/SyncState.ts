import { tagged } from '@code-expert/prelude';

export type SyncException =
  | tagged.Tagged<'conflictingChanges'>
  | tagged.Tagged<'readOnlyFilesChanged'>
  | tagged.Tagged<'invalidFilename'>
  | tagged.Tagged<'fileSizeExceeded'>
  | tagged.Tagged<'fileSystemCorrupted'>;

export const syncExceptionADT = tagged.build<SyncException>();

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
