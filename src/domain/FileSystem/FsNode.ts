import { iots } from '@code-expert/prelude';
import { FsDir, FsFile } from '@/lib/tauri/fs';

// "export as" with identical name is necessary for auto-imports to list this file as possible source
export type { FsFile as FsFile, FsDir as FsDir } from '@/lib/tauri/fs';

export const FsDirC: iots.Type<FsDir> = iots.strict({
  type: iots.literal('dir'),
  path: iots.string,
});

export const FsFileC: iots.Type<FsFile> = iots.strict({
  type: iots.literal('file'),
  path: iots.string,
});
