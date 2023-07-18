import { tagged } from '@code-expert/prelude';
import { apiError } from '@/utils/api';
import { panic } from '@/utils/error';

export type SyncException =
  | tagged.Tagged<'conflictingChanges'>
  | tagged.Tagged<'readOnlyFilesChanged', { path: string; reason: string }>
  | tagged.Tagged<'invalidFilename', string>
  // | tagged.Tagged<'fileSizeExceeded'>
  | tagged.Tagged<'fileSystemCorrupted', { path: string; reason: string }>
  | tagged.Tagged<'projectDirMissing'>
  | tagged.Tagged<'networkError', { reason: string }>;

export const syncExceptionADT = tagged.build<SyncException>();

export const fromHttpError = apiError.fold({
  notReady: () => panic('Unable to build a signed request'),
  noNetwork: () => syncExceptionADT.wide.networkError({ reason: 'No network' }),
  clientError: ({ message }) => syncExceptionADT.networkError({ reason: message }),
  serverError: ({ message }) => syncExceptionADT.networkError({ reason: message }),
});
