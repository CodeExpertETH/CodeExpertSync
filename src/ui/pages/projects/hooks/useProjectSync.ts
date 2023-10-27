import { api } from 'api';
import React from 'react';
import {
  array,
  boolean,
  constFalse,
  constTrue,
  constVoid,
  either,
  flow,
  identity,
  iots,
  not,
  option,
  pipe,
  task,
  taskEither,
  taskOption,
  tree,
} from '@code-expert/prelude';
import {
  LocalFileChange,
  LocalFileInfo,
  NativePath,
  Path,
  PersistedFileInfo,
  PfsNode,
  PfsPath,
  PfsPathFromStringC,
  ProjectDir,
  RemoteFileChange,
  RemoteFileInfo,
  RemoteNodeChange,
  RemoteNodeInfo,
  RemoteNodeInfoC,
  deleteSingleFile,
  eqPfsPath,
  fromRemoteFileInfo,
  getConflicts,
  getLocalChanges,
  getPfsParent,
  getRemoteChanges,
  hashInfoFromFsFile,
  isExcludedFromPfs,
  isValidDirName,
  isValidFileName,
  isWritable,
  localChangeType,
  pfsPathFromRelativePath,
  pfsPathToRelativePath,
  remoteChangeType,
  showNativePath,
  showPath,
  showPfsPath,
} from '@/domain/FileSystem';
import { FileSystemStack, fileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import {
  LocalProject,
  Project,
  ProjectId,
  getProjectDir,
  projectADT,
  projectDirToNativePath,
  projectPrism,
} from '@/domain/Project';
import { apiStack } from '@/domain/ProjectSync/apiStack';
import { downloadFile } from '@/domain/ProjectSync/downloadFile';
import { SyncException, fromHttpError, syncExceptionADT } from '@/domain/SyncException';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { FsNode, isFile } from '@/lib/tauri/fs';
import { useGlobalContext } from '@/ui/GlobalContext';
import { TimeContext, useTimeContext } from '@/ui/contexts/TimeContext';
import { apiGetSigned, apiPostSigned, requestBody } from '@/utils/api';
import { invariant, panic } from '@/utils/error';

const readFsTree =
  (stack: FileSystemStack) =>
  (nativePath: NativePath): taskEither.TaskEither<SyncException, tree.Tree<FsNode>> =>
    pipe(
      stack.readFsTree(nativePath),
      taskEither.mapLeft((e) =>
        syncExceptionADT.wide.fileSystemCorrupted({
          path: showNativePath.show(nativePath),
          reason: `Could not read FS tree (${e.message})`,
        }),
      ),
    );

const parsePath =
  (stack: FileSystemStack) =>
  (nativePath: NativePath) =>
  ({ type, path }: FsNode): taskEither.TaskEither<SyncException, PfsNode> =>
    pipe(
      stack.stripAncestor(nativePath)(path),
      taskEither.chainTaskK(stack.parsePath),
      taskEither.mapLeft((e) =>
        syncExceptionADT.wide.fileSystemCorrupted({
          path: showNativePath.show(path),
          reason: e.message,
        }),
      ),
      taskEither.chainOptionK(() =>
        syncExceptionADT.wide.fileSystemCorrupted({
          path: showNativePath.show(path),
          reason: 'Failed to process project file',
        }),
      )(identity),
      taskEither.map((relativePath) => ({ type, path: pfsPathFromRelativePath(relativePath) })),
    );

const excludeSystemNodes: (
  nativePath: NativePath,
) => (tree: tree.Tree<PfsNode>) => taskEither.TaskEither<SyncException, tree.Tree<PfsNode>> = (
  nativePath,
) =>
  flow(
    tree.filter(not(isExcludedFromPfs)),
    taskEither.fromOption(() =>
      syncExceptionADT.wide.fileSystemCorrupted({
        path: showNativePath.show(nativePath),
        reason: 'Failed to determine whether the given paths are excluded from PFS',
      }),
    ),
  );

/**
 * Possible Exceptions:
 * - has been synced before, but dir not present
 * - can't read dir or subdir
 *
 * By requiring {@link LocalProject} we have handled case 1. Case 2 & 3 are textbook exception, no need to differentiate
 */
const getProjectInfoLocal =
  (stack: FileSystemStack) =>
  (
    projectDir: ProjectDir,
    _: LocalProject,
  ): taskEither.TaskEither<SyncException, Array<LocalFileInfo>> =>
    pipe(
      projectDirToNativePath(stack)(projectDir),
      task.chain((nativePath) =>
        pipe(
          readFsTree(stack)(nativePath),
          taskEither.chain(tree.traverse(taskEither.ApplicativePar)(parsePath(stack)(nativePath))),
          taskEither.chain(excludeSystemNodes(nativePath)),
          taskEither.map(tree.toArray),
          taskEither.map(array.filter(isFile)),
          taskEither.chainTaskK(task.traverseArray(hashInfoFromFsFile(stack)(projectDir))),
          taskEither.map(array.unsafeFromReadonly),
        ),
      ),
    );

const getProjectInfoRemote = (
  projectId: ProjectId,
): taskEither.TaskEither<SyncException, { _id: ProjectId; files: Array<RemoteNodeInfo> }> =>
  pipe(
    apiGetSigned({
      path: `project/${projectId}/info`,
      codec: iots.strict({
        _id: ProjectId,
        files: iots.array(RemoteNodeInfoC),
      }),
    }),
    taskEither.mapLeft(fromHttpError),
  );

const findClosest =
  <A>(lookup: (path: PfsPath) => option.Option<A>) =>
  (relPath: PfsPath): either.Either<SyncException, A> =>
    pipe(
      lookup(relPath),
      option.fold(
        () =>
          pipe(
            getPfsParent(relPath),
            either.fromOption(() =>
              syncExceptionADT.fileSystemCorrupted({
                path: showPfsPath.show(relPath),
                reason: 'PFS root directory does not exist',
              }),
            ),
            either.chain(findClosest(lookup)),
          ),
        either.of,
      ),
    );

const checkClosestExistingAncestorIsWritable: (
  remote: Array<RemoteNodeInfo>,
) => (c: LocalFileChange) => either.Either<SyncException, LocalFileChange> = (remote) =>
  flow(
    either.of,
    either.chainFirst((file) =>
      pipe(
        file.path,
        findClosest((closestPath) =>
          pipe(
            remote,
            array.findFirst((i) => eqPfsPath.equals(i.path, closestPath)),
            option.map(isWritable),
          ),
        ),
        either.filterOrElse(boolean.isTrue, () =>
          syncExceptionADT.wide.fileAddedToReadOnlyDir(file),
        ),
      ),
    ),
  );

const checkValidFileName: (
  stack: FileSystemStack,
) => (c: LocalFileChange) => taskEither.TaskEither<SyncException, LocalFileChange> = (stack) =>
  flow(
    taskEither.of,
    taskEither.chainFirst(({ path }) =>
      pipe(
        pfsPathToRelativePath(path),
        stack.toNativePath,
        task.chain(stack.basename),
        taskEither.fromTaskOption(() =>
          syncExceptionADT.wide.fileSystemCorrupted({
            path: showPfsPath.show(path),
            reason: 'Could not determine basename of path',
          }),
        ),
        taskEither.filterOrElse(isValidFileName, (filename) =>
          syncExceptionADT.wide.invalidFilename(filename),
        ),
      ),
    ),
  );

const checkEveryNewAncestorIsValidDirName =
  (stack: FileSystemStack) =>
  (remote: Array<RemoteNodeInfo>) =>
  (change: LocalFileChange): taskEither.TaskEither<SyncException, LocalFileChange> => {
    const ancestors = (path: PfsPath): Array<PfsPath> =>
      array.unfold(
        path,
        flow(
          getPfsParent,
          option.map((x) => [x, x]),
        ),
      );

    const isExisting = (path: PfsPath) => remote.some((i) => eqPfsPath.equals(i.path, path));
    const isNew = (path: PfsPath) => !isExisting(path);

    const basename = (path: Path) =>
      pipe(
        stack.toNativePath(path),
        task.chain(stack.basename),
        taskOption.filter(isValidDirName),
        taskEither.fromTaskOption(() =>
          syncExceptionADT.wide.fileSystemCorrupted({
            path: showPath.show(path),
            reason: 'Invalid project file path',
          }),
        ),
      );

    return pipe(
      taskEither.of(change),
      taskEither.chainFirst(({ path }) =>
        pipe(
          ancestors(path),
          array.filter(isNew),
          array.map(pfsPathToRelativePath),
          taskEither.traverseArray(basename),
        ),
      ),
    );
  };

const findRemoteForLocalFileChange =
  (remote: Array<RemoteNodeInfo>) =>
  (local: LocalFileChange): RemoteFileInfo =>
    pipe(
      remote,
      array.filter(isFile),
      array.findFirst((i) => eqPfsPath.equals(i.path, local.path)),
      option.getOrElseW(() => panic('Expected to find local file in list of remote files.')),
    );

const validateAddedFileChange: (
  stack: FileSystemStack,
) => (
  remote: Array<RemoteNodeInfo>,
) => (c: LocalFileChange) => taskEither.TaskEither<SyncException, LocalFileChange> =
  (stack: FileSystemStack) => (remote: Array<RemoteNodeInfo>) =>
    flow(
      checkClosestExistingAncestorIsWritable(remote),
      taskEither.fromEither,
      taskEither.chain(checkEveryNewAncestorIsValidDirName(stack)(remote)),
      taskEither.chainFirst(checkValidFileName(stack)),
    );

const validateRemovedFileChange: (
  remote: Array<RemoteNodeInfo>,
) => (c: LocalFileChange) => either.Either<SyncException, LocalFileChange> = (remote) =>
  flow(
    either.of,
    either.chainFirstW(
      flow(
        findRemoteForLocalFileChange(remote),
        either.fromPredicate(isWritable, syncExceptionADT.readOnlyFileChanged),
      ),
    ),
    either.chain(checkClosestExistingAncestorIsWritable(remote)),
  );

const validateUpdatedFileChange: (
  remote: Array<RemoteNodeInfo>,
) => (c: LocalFileChange) => either.Either<SyncException, LocalFileChange> = (remote) =>
  flow(
    either.of,
    either.chainFirst(
      flow(
        findRemoteForLocalFileChange(remote),
        either.fromPredicate(isWritable, syncExceptionADT.readOnlyFileChanged),
      ),
    ),
  );

// TODO: filter localChanges that are in conflict with remoteChanges
/**
 * Pre-conditions:
 * - filter conflicting changes
 *
 * The LocalFileChange gets computed by comparing local file system state with previously synced remote state. If a file
 * gets categorized as 'updated', but the file has been 'removed' on the remote, we would be unable to determine it's
 * permissions.
 */
const getFilesToUpload =
  (stack: FileSystemStack) =>
  (
    local: Array<LocalFileChange>,
    remote: Array<RemoteNodeInfo>,
  ): taskEither.TaskEither<SyncException, Array<LocalFileChange>> =>
    pipe(
      local,
      array.filter((c) =>
        localChangeType.fold(c.change, {
          noChange: constFalse,
          added: constTrue,
          removed: constTrue,
          updated: constTrue,
        }),
      ),
      taskEither.traverseArray((x) =>
        localChangeType.fold<taskEither.TaskEither<SyncException, LocalFileChange>>(x.change, {
          noChange: () => panic('File has no changes'),
          added: () => validateAddedFileChange(stack)(remote)(x),
          removed: () => pipe(x, validateRemovedFileChange(remote), task.of),
          updated: () => pipe(x, validateUpdatedFileChange(remote), task.of),
        }),
      ),
      taskEither.map(array.unsafeFromReadonly),
    );

const getFilesToDownload =
  (projectInfoRemote: Array<RemoteNodeInfo>) =>
  (remoteChanges: Array<RemoteFileChange>): Array<RemoteFileInfo> =>
    pipe(
      projectInfoRemote,
      array.filter(({ path }) =>
        pipe(
          remoteChanges,
          array.filter((c) =>
            remoteChangeType.fold(c.change, {
              noChange: constFalse,
              added: constTrue,
              removed: constFalse,
              updated: constTrue,
            }),
          ),
          array.exists((file) => eqPfsPath.equals(file.path, path)),
        ),
      ),
      // fixme: remove this. possibly just filter remoteChanges for "added" and "updated"
      array.map((nodeInfo) => {
        invariant(isFile(nodeInfo), 'getFilesToDownload found a directory with remoteChangeType');
        return nodeInfo;
      }),
    );

const getFilesToDelete = (remoteChanges: Array<RemoteNodeChange>): Array<RemoteFileChange> =>
  pipe(
    remoteChanges,
    array.filter(isFile),
    array.filter((c) =>
      remoteChangeType.fold(c.change, {
        noChange: constFalse,
        added: constFalse,
        removed: constTrue,
        updated: constFalse,
      }),
    ),
  );

export const uploadChangedFiles =
  (stack: FileSystemStack & TimeContext) =>
  (
    projectId: ProjectId,
    projectDir: ProjectDir,
    localChanges: Array<LocalFileChange>,
  ): taskEither.TaskEither<SyncException, void> =>
    pipe(
      taskEither.Do,
      taskEither.let('uploadFiles', () =>
        pipe(
          localChanges,
          array.filter((c) =>
            localChangeType.fold(c.change, {
              noChange: constFalse,
              added: constTrue,
              removed: constFalse,
              updated: constTrue,
            }),
          ),
          array.map(({ path }) => path),
        ),
      ),
      taskEither.bindTaskK('archivePath', () =>
        pipe(
          stack.tempDir,
          taskEither.getOrElse((e) => {
            throw e;
          }),
          task.bindTo('tempDir'),
          task.bind('t', () => task.fromIO(stack.now)),
          task.chain(({ tempDir, t }) =>
            pipe(
              tempDir,
              stack.append([iots.brandFromLiteral(`project_${projectId}_${t.getTime()}.tar.br`)]),
            ),
          ),
        ),
      ),
      taskEither.bindTaskK('tarHash', ({ uploadFiles, archivePath }) =>
        pipe(
          projectDirToNativePath(stack)(projectDir),
          task.chain((nativeDir) => api.buildTar(archivePath, nativeDir, uploadFiles)),
        ),
      ),
      taskEither.let('removeFiles', () =>
        pipe(
          localChanges,
          array.filter((c) =>
            localChangeType.fold(c.change, {
              noChange: constFalse,
              added: constFalse,
              removed: constTrue,
              updated: constFalse,
            }),
          ),
          array.map(({ path }) => path),
        ),
      ),
      taskEither.bindTaskK('body', ({ uploadFiles, archivePath }) =>
        pipe(
          array.isEmpty(uploadFiles)
            ? taskEither.of(new Uint8Array())
            : stack.readBinaryFile(archivePath),
          taskEither.getOrElse((e) => {
            throw e;
          }),
        ),
      ),
      taskEither.map(({ removeFiles, ...rest }) => ({
        removeFiles: pipe(removeFiles, array.map(PfsPathFromStringC.encode)),
        ...rest,
      })),
      taskEither.chain(({ body, tarHash, removeFiles, uploadFiles }) =>
        pipe(
          apiPostSigned({
            path: `project/${projectId}/files`,
            jwtPayload: array.isEmpty(uploadFiles) ? { removeFiles } : { tarHash, removeFiles },
            body: requestBody.binary({
              body,
              type: 'application/x-tar',
              encoding: option.some('br'),
            }),
            codec: iots.strict({
              _id: ProjectId,
              files: iots.array(RemoteNodeInfoC),
            }),
          }),
          taskEither.mapLeft(fromHttpError),
        ),
      ),
      taskEither.map(constVoid),
    );

const checkConflicts = <R>({
  localChanges,
  remoteChanges,
}: {
  localChanges: option.Option<NonEmptyArray<LocalFileChange>>;
  remoteChanges: option.Option<NonEmptyArray<RemoteNodeChange>>;
} & R): either.Either<SyncException, void> =>
  pipe(
    option.sequenceS({ local: localChanges, remote: remoteChanges }),
    option.chain(({ local, remote }) => getConflicts(local, remote)),
    option.fold(
      () => either.right(undefined),
      flow(syncExceptionADT.conflictingChanges, either.left),
    ),
  );

export type ForceSyncDirection = 'push' | 'pull';

export type RunProjectSync = (
  project: Project,
  options?: { force?: ForceSyncDirection },
) => taskEither.TaskEither<SyncException, void>;

type TotalSyncActions = {
  upload: option.Option<Array<LocalFileChange>>;
  download: option.Option<Array<RemoteFileInfo>>;
  delete: option.Option<Array<LocalFileChange>>;
};
const getSyncActions: (
  stack: FileSystemStack,
) => (
  force: ForceSyncDirection | undefined,
  previous: option.Option<Array<PersistedFileInfo>>,
  local: option.Option<Array<LocalFileInfo>>,
  remote: Array<RemoteNodeInfo>,
) => taskEither.TaskEither<SyncException, TotalSyncActions> =
  (stack) => (force, projectInfoPrevious, projectInfoLocal, projectInfoRemote) =>
    pipe(
      taskEither.Do,
      taskEither.let('remoteChanges', () =>
        pipe(
          projectInfoPrevious,
          option.fold(
            // the project has never been synced before
            () => getRemoteChanges([], projectInfoRemote),
            (previous) => getRemoteChanges(previous, projectInfoRemote),
          ),
          option.filter(() => force == null || force === 'pull'),
        ),
      ),
      taskEither.let('localChanges', () =>
        pipe(
          option.sequenceS({ local: projectInfoLocal, previous: projectInfoPrevious }),
          option.chain(({ local, previous }) => getLocalChanges(previous, local)),
          option.filter(() => force == null || force === 'push'),
        ),
      ),
      taskEither.chainFirstEitherKW(checkConflicts), // Validated + conflict free change
      taskEither.chain(({ localChanges, remoteChanges }) =>
        pipe(
          localChanges,
          option.traverse(taskEither.ApplicativePar)((changes) =>
            getFilesToUpload(stack)(changes, projectInfoRemote),
          ),
          taskEither.map(
            (upload): TotalSyncActions => ({
              upload,
              download: option.map(getFilesToDownload(projectInfoRemote))(remoteChanges),
              delete: option.map(getFilesToDelete)(remoteChanges),
            }),
          ),
        ),
      ),
    );

export const useProjectSync = () => {
  const time = useTimeContext();
  const { projectRepository } = useGlobalContext();

  return React.useCallback<RunProjectSync>(
    (project, { force } = {}) => {
      const projectId = project.value.projectId;
      const stack = { ...fileSystemStack, ...time, ...apiStack };
      return pipe(
        taskEither.Do,
        // setup
        taskEither.bindTaskK('projectDir', () => getProjectDir(project)),
        // change detection
        taskEither.let('projectInfoPrevious', () =>
          pipe(
            projectPrism.local.getOption(project),
            option.map(({ value: { files } }) => files),
          ),
        ),
        taskEither.bindW('projectInfoRemote', () => getProjectInfoRemote(projectId)),
        taskEither.bind('projectInfoLocal', ({ projectDir }) =>
          pipe(
            projectPrism.local.getOption(project),
            option.traverse(taskEither.ApplicativePar)((project) =>
              getProjectInfoLocal(stack)(projectDir, project),
            ),
          ),
        ),
        taskEither.bind('actions', ({ projectInfoPrevious, projectInfoLocal, projectInfoRemote }) =>
          getSyncActions(stack)(
            force,
            projectInfoPrevious,
            projectInfoLocal,
            projectInfoRemote.files,
          ),
        ),
        // upload local changed files
        taskEither.chainFirst(({ projectDir, actions }) =>
          pipe(
            actions.upload,
            option.fold(
              () => taskEither.of(undefined),
              (filesToUpload) => uploadChangedFiles(stack)(projectId, projectDir, filesToUpload),
            ),
          ),
        ),
        // download and write added and updated files
        taskEither.chainFirst(({ actions, projectDir }) =>
          pipe(
            actions.download,
            option.foldW(
              () => taskEither.of<SyncException, void>(undefined),
              (files) =>
                pipe(
                  files,
                  array.traverse(taskEither.ApplicativeSeq)((file) =>
                    downloadFile(stack)({ file, projectId, projectDir }),
                  ),
                  taskEither.map(constVoid),
                ),
            ),
          ),
        ),
        //delete remote removed files
        taskEither.chainFirstTaskK(({ actions, projectDir }) =>
          pipe(
            actions.delete,
            option.foldW(
              () => task.of(undefined),
              (filesToDelete) =>
                pipe(
                  filesToDelete,
                  array.traverse(task.ApplicativeSeq)(deleteSingleFile(stack, projectDir)),
                ),
            ),
          ),
        ),
        // update all project metadata
        taskEither.bindW('updatedProjectInfo', ({ projectDir }) =>
          pipe(
            // fixme: why are we not using the result of uploadChangedFiles?
            getProjectInfoRemote(project.value.projectId),
            taskEither.chainW((projectInfoRemote) =>
              pipe(
                projectInfoRemote.files,
                array.filter(isFile),
                array.traverse(task.ApplicativeSeq)(fromRemoteFileInfo(stack)(projectDir)),
                task.map((files) => ({ ...projectInfoRemote, files })),
                taskEither.fromTask,
              ),
            ),
          ),
        ),
        // store new state
        taskEither.chainFirstTaskK(({ updatedProjectInfo, projectDir }) =>
          projectRepository.upsertOne(
            projectADT.local({
              ...project.value,
              files: updatedProjectInfo.files,
              basePath: projectDir.base,
              syncedAt: time.now(),
              syncState: projectADT.fold(project, {
                remote: () => syncStateADT.synced(changesADT.unknown()),
                local: ({ syncState }) => syncState,
              }),
            }),
          ),
        ),
        taskEither.map(constVoid),
      );
    },
    [projectRepository, time],
  );
};
