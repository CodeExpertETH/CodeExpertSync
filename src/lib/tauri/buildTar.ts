import { invoke } from '@tauri-apps/api';
import { array, pipe, task } from '@code-expert/prelude';
import { NativePath, isoNativePath } from '@/domain/FileSystem';

export const buildTar =
  ({
    tarFile,
    rootDir,
    files,
  }: {
    tarFile: NativePath;
    rootDir: NativePath;
    files: Array<NativePath>;
  }): task.Task<string> =>
  () =>
    invoke('build_tar', {
      fileName: isoNativePath.unwrap(tarFile),
      rootDir: isoNativePath.unwrap(rootDir),
      files: pipe(files, array.map(isoNativePath.unwrap)),
    });
