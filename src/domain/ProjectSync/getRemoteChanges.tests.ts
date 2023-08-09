import { fc } from '@code-expert/test-utils';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { Lens } from 'monocle-ts';
import { assert, describe, it } from 'vitest';
import { nonEmptyArray, option, pipe } from '@code-expert/prelude';
import {
  RemoteDirInfo,
  RemoteFileChange,
  RemoteFileInfo,
  RemoteNodeInfo,
  getRemoteChanges,
  remoteChangeType,
} from '@/domain/FileSystem';
import { pfsPathArb } from '@/domain/FileSystem/Path.tests';
import { ordFsNode } from '@/lib/tauri/fs';

const Version = Lens.fromProp<RemoteNodeInfo>()('version');
const incrementVersion = Version.modify((v) => v + 1);

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
  const toRemoved = (fileInfo: RemoteFileInfo): RemoteFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: remoteChangeType.removed(),
  });
  const toAdded = (fileInfo: RemoteFileInfo): RemoteFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: remoteChangeType.added(fileInfo.version),
  });
  const toUpdated = (fileInfo: RemoteFileInfo): RemoteFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: remoteChangeType.updated(fileInfo.version),
  });

  it('should classify missing files as "removed"', () => {
    const dirsArb = fc.array(remoteDirInfoArb);
    const commonFilesArb = fc.array(remoteFileInfoArb);
    const missingFilesArb = fc.nonEmptyArray(remoteFileInfoArb);

    const missingToRemoved = (
      dirs: Array<RemoteDirInfo>,
      commonFiles: Array<RemoteFileInfo>,
      missingFiles: NonEmptyArray<RemoteFileInfo>,
    ) =>
      assert.deepEqual(
        // fixme: does concat order matter? how do we make it not matter?
        getRemoteChanges([...commonFiles, ...missingFiles], [...commonFiles, ...dirs]),
        pipe(missingFiles, nonEmptyArray.map(toRemoved), option.some),
      );

    fc.assert(fc.property(dirsArb, commonFilesArb, missingFilesArb, missingToRemoved));
  });

  it('should classify new files as "added"', () => {
    const dirsArb = fc.array(remoteDirInfoArb);
    const commonFilesArb = fc.array(remoteFileInfoArb);
    const newFilesArb = fc.nonEmptyArray(remoteFileInfoArb);

    const newToAdded = (
      dirs: Array<RemoteDirInfo>,
      commonFiles: Array<RemoteFileInfo>,
      newFiles: NonEmptyArray<RemoteFileInfo>,
    ) =>
      assert.deepEqual(
        getRemoteChanges([...commonFiles], [...commonFiles, ...dirs, ...newFiles]),
        pipe(newFiles, nonEmptyArray.map(toAdded), option.some),
      );

    fc.assert(fc.property(dirsArb, commonFilesArb, newFilesArb, newToAdded));
  });

  it('should classify files with a different version as "updated"', () => {
    const dirsArb = fc.array(remoteDirInfoArb);
    const commonFilesArb = fc.array(remoteFileInfoArb);
    const changedFilesArb = fc.nonEmptyArray(remoteFileInfoArb);

    const changedToUpdated = (
      dirs: Array<RemoteDirInfo>,
      commonFiles: Array<RemoteFileInfo>,
      changedFiles: NonEmptyArray<RemoteFileInfo>,
    ) =>
      assert.deepEqual(
        getRemoteChanges(
          [...commonFiles, ...changedFiles],
          [...commonFiles, ...dirs, ...changedFiles.map(incrementVersion)],
        ),
        pipe(changedFiles, nonEmptyArray.map(toUpdated), option.some),
      );

    fc.assert(fc.property(dirsArb, commonFilesArb, changedFilesArb, changedToUpdated));
  });

  it('should do all three at the same time', () => {
    const dirsArb = fc.array(remoteDirInfoArb);
    const commonFilesArb = fc.array(remoteFileInfoArb);
    const missingFilesArb = fc.nonEmptyArray(remoteFileInfoArb);
    const newFilesArb = fc.nonEmptyArray(remoteFileInfoArb);
    const changedFilesArb = fc.nonEmptyArray(remoteFileInfoArb);

    const removedNewChanged = (
      dirs: Array<RemoteDirInfo>,
      commonFiles: Array<RemoteFileInfo>,
      missingFiles: NonEmptyArray<RemoteFileInfo>,
      newFiles: NonEmptyArray<RemoteFileInfo>,
      changedFiles: NonEmptyArray<RemoteFileInfo>,
    ) =>
      assert.deepEqual(
        pipe(
          getRemoteChanges(
            [...commonFiles, ...missingFiles, ...changedFiles],
            [...commonFiles, ...dirs, ...newFiles, ...changedFiles.map(incrementVersion)],
          ),
          option.map(nonEmptyArray.sort<RemoteFileChange>(ordFsNode)),
        ),
        pipe(
          [
            nonEmptyArray.map(toRemoved)(missingFiles),
            nonEmptyArray.map(toAdded)(newFiles),
            nonEmptyArray.map(toUpdated)(changedFiles),
          ],
          nonEmptyArray.concatAll(nonEmptyArray.getSemigroup()),
          nonEmptyArray.sort<RemoteFileChange>(ordFsNode),
          option.some,
        ),
      );

    fc.assert(
      fc.property(
        dirsArb,
        commonFilesArb,
        missingFilesArb,
        newFilesArb,
        changedFilesArb,
        removedNewChanged,
      ),
    );
  });
});
