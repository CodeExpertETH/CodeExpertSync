import { fc } from '@code-expert/test-utils';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import * as nodePath from 'path';
import { assert, describe, it } from 'vitest';
import { nonEmptyArray, option, pipe, task, taskEither } from '@code-expert/prelude';
import {
  RemoteDirInfo,
  RemoteFileChange,
  RemoteFileInfo,
  getRemoteChanges,
  remoteChangeType,
} from '@/domain/FileSystem';
import { pfsPathArb } from '@/domain/FileSystem/Path.tests';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { escape } from '@/lib/tauri/path';
import { panic } from '@/utils/error';

export const nodeFsStack: FileSystemStack = {
  dirname: (path) => taskEither.fromIO(() => nodePath.dirname(path)),
  join: (...paths) => task.fromIO(() => nodePath.join(...paths)),
  stripAncestor: (ancestor) => (to) =>
    taskEither.fromIO(() => {
      const relative = nodePath.relative(ancestor, to);
      const normalized = nodePath.normalize(relative);
      return nodePath.format({ dir: '.', base: normalized });
    }),
  escape,
  getFileHash: () => panic('getFileHash is not implemented on nodeFsStack'),
  removeFile: () => panic('removeFile is not implemented on nodeFsStack'),
};

const remoteFileInfoArb = fc.record<RemoteFileInfo>({
  type: fc.constant('file'),
  path: pfsPathArb,
  version: fc.nat(),
  permissions: fc.constantFrom('r', 'rw'),
});

const remoteDirInfoArb = fc.record<RemoteDirInfo>({
  type: fc.constant('dir'),
  path: pfsPathArb,
  version: fc.nat(),
  permissions: fc.constantFrom('r', 'rw'),
});

describe('getRemoteChanges', () => {
  it('should classify missing files as "removed"', () => {
    const dirsArb = fc.array(remoteDirInfoArb);
    const commonFilesArb = fc.array(remoteFileInfoArb);
    const removedFilesArb = fc.nonEmptyArray(remoteFileInfoArb);

    const missingToRemoved = (
      dirs: Array<RemoteDirInfo>,
      commonFiles: Array<RemoteFileInfo>,
      removedFiles: NonEmptyArray<RemoteFileInfo>,
    ) =>
      assert.deepEqual(
        getRemoteChanges([...commonFiles, ...removedFiles], [...commonFiles, ...dirs]),
        pipe(
          removedFiles,
          nonEmptyArray.map(
            (fileInfo): RemoteFileChange => ({
              path: fileInfo.path,
              type: 'file',
              change: remoteChangeType.removed(),
            }),
          ),
          option.some,
        ),
      );

    fc.assert(fc.property(dirsArb, commonFilesArb, removedFilesArb, missingToRemoved));
  });

  // it('should classify new files as "added"', () => {
  //   const previous: Array<RemoteFileInfo> = [];
  //   const latest: Array<RemoteNodeInfo> = [
  //     { path: iots.brandFromLiteral('./main.py'), type: 'file', version: 1, permissions: 'rw' },
  //   ];
  //   assert.deepEqual(
  //     getRemoteChanges(previous, latest),
  //     option.some<NonEmptyArray<RemoteFileChange>>([
  //       {
  //         path: iots.brandFromLiteral('./main.py'),
  //         type: 'file',
  //         change: remoteChangeType.added(1),
  //       },
  //     ]),
  //   );
  // });
  //
  // it('should classify files with a different version as "updated"', () => {
  //   const previous: Array<RemoteFileInfo> = [
  //     { path: iots.brandFromLiteral('./main.py'), type: 'file', version: 1, permissions: 'rw' },
  //   ];
  //   const latest: Array<RemoteNodeInfo> = [
  //     { path: iots.brandFromLiteral('./main.py'), type: 'file', version: 2, permissions: 'rw' },
  //   ];
  //   assert.deepEqual(
  //     getRemoteChanges(previous, latest),
  //     option.some<NonEmptyArray<RemoteFileChange>>([
  //       {
  //         path: iots.brandFromLiteral('./main.py'),
  //         type: 'file',
  //         change: remoteChangeType.updated(1),
  //       },
  //     ]),
  //   );
  // });
});
