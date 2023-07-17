import { tagged } from '@code-expert/prelude';

export type SyncException =
  | tagged.Tagged<'conflictingChanges'>
  | tagged.Tagged<'readOnlyFilesChanged', { path: string; reason: string }>
  | tagged.Tagged<'invalidFilename', string>
  // | tagged.Tagged<'fileSizeExceeded'>
  | tagged.Tagged<'fileSystemCorrupted', { path: string; reason: string }>
  | tagged.Tagged<'projectDirMissing'>
  | tagged.Tagged<'networkError', { reason: string }>;

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
