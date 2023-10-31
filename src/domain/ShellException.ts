import { tagged } from '@code-expert/prelude';
import { NativePath } from '@/domain/FileSystem/NativePath';

export type ShellException = tagged.Tagged<'noSuchDirectory', { reason: string; path: NativePath }>;

export const shellExceptionADT = tagged.build<ShellException>();
