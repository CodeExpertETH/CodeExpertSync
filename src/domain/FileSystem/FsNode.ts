import { iots } from '@code-expert/prelude';
import { FsDir, FsFile } from '@/lib/tauri/fs';

export * from '@/lib/tauri/fs';

export const FsDirC: iots.Type<FsDir> = iots.strict({
  type: iots.literal('dir'),
  path: iots.string,
});

export const FsFileC: iots.Type<FsFile> = iots.strict({
  type: iots.literal('file'),
  path: iots.string,
});
