import { fc } from '@code-expert/test-utils';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import { Lens } from 'monocle-ts';
import * as nodePath from 'path';
import { assert, describe, it } from 'vitest';
import { nonEmptyArray, option, pipe, task, taskEither } from '@code-expert/prelude';
import {
  LocalFileChange,
  LocalFileInfo,
  getLocalChanges,
  localChangeType,
} from '@/domain/FileSystem';
import { pfsPathArb } from '@/domain/FileSystem/Path.tests';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { ordFsNode } from '@/lib/tauri/fs';
import { escape } from '@/lib/tauri/path';
import { panic } from '@/utils/error';

const Hash = Lens.fromProp<LocalFileInfo>()('hash');
const modifyHash = Hash.modify((h) => h + '2');

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

const localFileInfoArb = fc.record<LocalFileInfo>({
  type: fc.constant('file'),
  path: pfsPathArb,
  hash: fc.string({ minLength: 8, maxLength: 8 }),
});

describe('getLocalChanges', () => {
  const toRemoved = (fileInfo: LocalFileInfo): LocalFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: localChangeType.removed(),
  });
  const toAdded = (fileInfo: LocalFileInfo): LocalFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: localChangeType.added(),
  });
  const toUpdated = (fileInfo: LocalFileInfo): LocalFileChange => ({
    path: fileInfo.path,
    type: 'file',
    change: localChangeType.updated(),
  });

  it('should classify missing files as "removed"', () => {
    const commonFilesArb = fc.array(localFileInfoArb);
    const missingFilesArb = fc.nonEmptyArray(localFileInfoArb);

    const missingToRemoved = (
      commonFiles: Array<LocalFileInfo>,
      missingFiles: NonEmptyArray<LocalFileInfo>,
    ) =>
      assert.deepEqual(
        getLocalChanges([...commonFiles, ...missingFiles], [...commonFiles]),
        pipe(missingFiles, nonEmptyArray.map(toRemoved), option.some),
      );

    fc.assert(fc.property(commonFilesArb, missingFilesArb, missingToRemoved));
  });

  it('should classify new files as "added"', () => {
    const commonFilesArb = fc.array(localFileInfoArb);
    const newFilesArb = fc.nonEmptyArray(localFileInfoArb);

    const newToAdded = (
      commonFiles: Array<LocalFileInfo>,
      newFiles: NonEmptyArray<LocalFileInfo>,
    ) =>
      assert.deepEqual(
        getLocalChanges([...commonFiles], [...commonFiles, ...newFiles]),
        pipe(newFiles, nonEmptyArray.map(toAdded), option.some),
      );

    fc.assert(fc.property(commonFilesArb, newFilesArb, newToAdded));
  });

  it('should classify files with a different version as "updated"', () => {
    const commonFilesArb = fc.array(localFileInfoArb);
    const changedFilesArb = fc.nonEmptyArray(localFileInfoArb);

    const changedToUpdated = (
      commonFiles: Array<LocalFileInfo>,
      changedFiles: NonEmptyArray<LocalFileInfo>,
    ) =>
      assert.deepEqual(
        getLocalChanges(
          [...commonFiles, ...changedFiles],
          [...commonFiles, ...changedFiles.map(modifyHash)],
        ),
        pipe(changedFiles, nonEmptyArray.map(toUpdated), option.some),
      );

    fc.assert(fc.property(commonFilesArb, changedFilesArb, changedToUpdated));
  });

  it('should do all three at the same time', () => {
    const commonFilesArb = fc.array(localFileInfoArb);
    const missingFilesArb = fc.nonEmptyArray(localFileInfoArb);
    const newFilesArb = fc.nonEmptyArray(localFileInfoArb);
    const changedFilesArb = fc.nonEmptyArray(localFileInfoArb);

    const removedNewChanged = (
      commonFiles: Array<LocalFileInfo>,
      missingFiles: NonEmptyArray<LocalFileInfo>,
      newFiles: NonEmptyArray<LocalFileInfo>,
      changedFiles: NonEmptyArray<LocalFileInfo>,
    ) =>
      assert.deepEqual(
        pipe(
          getLocalChanges(
            [...commonFiles, ...missingFiles, ...changedFiles],
            [...commonFiles, ...newFiles, ...changedFiles.map(modifyHash)],
          ),
          option.map(nonEmptyArray.sort<LocalFileChange>(ordFsNode)),
        ),
        pipe(
          [
            nonEmptyArray.map(toRemoved)(missingFiles),
            nonEmptyArray.map(toAdded)(newFiles),
            nonEmptyArray.map(toUpdated)(changedFiles),
          ],
          nonEmptyArray.concatAll(nonEmptyArray.getSemigroup()),
          nonEmptyArray.sort<LocalFileChange>(ordFsNode),
          option.some,
        ),
      );

    fc.assert(
      fc.property(commonFilesArb, missingFilesArb, newFilesArb, changedFilesArb, removedNewChanged),
    );
  });
});
