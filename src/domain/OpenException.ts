import { tagged } from '@code-expert/prelude';
import { NativePath } from '@/domain/FileSystem/NativePath';

export type OpenException = tagged.Tagged<'noSuchDirectory', { reason: string; path: NativePath }>;

export const openExceptionADT = tagged.build<OpenException>();
