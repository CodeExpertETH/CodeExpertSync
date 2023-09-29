import { invoke } from '@tauri-apps/api';
import { array, pipe, taskEither } from '@code-expert/prelude';
import { NativePath, isoNativePath } from '@/domain/FileSystem';
import { TauriException, fromTauriError } from '@/lib/tauri/TauriException';

export const buildTar = ({
  tarFile,
  rootDir,
  files,
}: {
  tarFile: NativePath;
  rootDir: NativePath;
  files: Array<NativePath>;
}): taskEither.TaskEither<TauriException, string> =>
  taskEither.tryCatch(
    () =>
      invoke('build_tar', {
        fileName: isoNativePath.unwrap(tarFile),
        rootDir: isoNativePath.unwrap(rootDir),
        files: pipe(files, array.map(isoNativePath.unwrap)),
      }),
    fromTauriError,
  );
