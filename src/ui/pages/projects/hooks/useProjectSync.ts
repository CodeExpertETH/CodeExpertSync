import { ResponseType } from '@tauri-apps/api/http';
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
  iots,
  not,
  number,
  option,
  ord,
  pipe,
  string,
  task,
  taskEither,
  taskOption,
  tree,
} from '@code-expert/prelude';
import {
  LocalFileInfo,
  LocalNodeChange,
  RemoteDirInfo,
  RemoteFileChange,
  RemoteNodeChange,
  RemoteNodeInfo,
  RemoteNodeInfoC,
  deleteSingleFile,
  fromRemoteFileInfo,
  getConflicts,
  getLocalChanges,
  getRemoteChanges,
  hashInfoFromFsFile,
  isReadOnly,
  isValidDirName,
  isValidFileName,
  isWritable,
  localChangeType,
  remoteChangeType,
} from '@/domain/FileSystem';
import { FileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import {
  LocalProject,
  Project,
  ProjectId,
  getProjectDirRelative,
  projectADT,
  projectPrism,
} from '@/domain/Project';
import { SyncException, fromHttpError, syncExceptionADT } from '@/domain/SyncException';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { fs as libFs, os as libOs, path as libPath } from '@/lib/tauri';
import { FsNode, isDir, isFile } from '@/lib/tauri/fs';
import { useGlobalContext } from '@/ui/GlobalContext';
import { useTimeContext } from '@/ui/contexts/TimeContext';
import { apiGetSigned, apiPostSigned, requestBody } from '@/utils/api';
import { panic } from '@/utils/error';

const updateDir =
  (projectDir: string) =>
  (fileInfo: RemoteDirInfo): taskEither.TaskEither<SyncException, void> =>
    pipe(
      taskEither.Do,
      taskEither.bindTaskK('systemFilePath', () => libPath.join(projectDir, fileInfo.path)),
      taskEither.chainW(({ systemFilePath }) =>
        pipe(
          api.createProjectDir(systemFilePath, isReadOnly(fileInfo)),
          taskEither.mapLeft(({ message: reason }) =>
            syncExceptionADT.fileSystemCorrupted({ path: systemFilePath, reason }),
          ),
        ),
      ),
    );

const writeSingleFile = ({
  fileInfo,
  projectId,
  projectDir,
}: {
  fileInfo: RemoteNodeInfo;
  projectId: ProjectId;
  projectDir: string;
}): taskEither.TaskEither<SyncException, void> =>
  pipe(
    taskEither.Do,
    taskEither.bindTaskK('systemFilePath', () => libPath.join(projectDir, fileInfo.path)),
    taskEither.chainFirst(({ systemFilePath }) =>
      pipe(
        api.createProjectPath(projectDir),
        taskEither.mapLeft(({ message: reason }) =>
          syncExceptionADT.wide.fileSystemCorrupted({ path: projectDir, reason }),
        ),
        taskEither.chain(() =>
          pipe(
            apiGetSigned({
              path: `project/${projectId}/file`,
              jwtPayload: { path: fileInfo.path },
              codec: iots.string,
              responseType: ResponseType.Text,
            }),
            taskEither.mapLeft(fromHttpError),
          ),
        ),
        taskEither.chain((fileContent) =>
          pipe(
            api.writeProjectFile(systemFilePath, fileContent, isReadOnly(fileInfo)),
            taskEither.mapLeft(({ message: reason }) =>
              syncExceptionADT.wide.fileSystemCorrupted({ path: projectDir, reason }),
            ),
          ),
        ),
      ),
    ),
    taskEither.map(constVoid),
  );

const isVisibleFsNode = (node: FsNode): task.Task<boolean> =>
  pipe(libPath.basename(node.path), task.map(option.exists(not(string.startsWith('.')))));

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
    projectDir: string,
    _: LocalProject,
  ): taskEither.TaskEither<SyncException, Array<LocalFileInfo>> =>
    pipe(
      libFs.readFsTree(projectDir),
      taskEither.mapLeft((e) =>
        syncExceptionADT.fileSystemCorrupted({
          path: projectDir,
          reason: e.message,
        }),
      ),
      taskEither.map((x) => tree.toArray(x)),
      taskEither.chainTaskK(array.filterE(task.ApplicativePar)(isVisibleFsNode)),
      taskEither.map(array.filter(isFile)),
      taskEither.chain(
        taskEither.traverseArray(({ path, type }) =>
          pipe(
            libPath.stripAncestor(projectDir)(path),
            taskEither.bimap(
              (e) =>
                syncExceptionADT.fileSystemCorrupted({
                  path: projectDir,
                  reason: e.message,
                }),
              (relative) => ({ path: relative, type }),
            ),
          ),
        ),
      ),
      taskEither.chainTaskK(task.traverseArray(hashInfoFromFsFile(stack, projectDir))),
      taskEither.map(array.unsafeFromReadonly),
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
  <A>(map: (path: string) => option.Option<A>) =>
  (relPath: string): taskEither.TaskEither<SyncException, A> =>
    pipe(
      map(relPath),
      option.fold(
        () =>
          relPath === '.'
            ? taskEither.left(
                syncExceptionADT.fileSystemCorrupted({
                  path: relPath,
                  reason: 'Root directory must exist',
                }),
              )
            : pipe(
                libPath.dirname(relPath),
                taskEither.mapLeft(({ message: reason }) =>
                  syncExceptionADT.fileSystemCorrupted({
                    path: relPath,
                    reason,
                  }),
                ),
                taskEither.chain(findClosest(map)),
              ),
        taskEither.of,
      ),
    );

const checkClosestExistingAncestorIsWritable: (
  remote: Array<RemoteNodeInfo>,
) => (c: LocalNodeChange) => taskEither.TaskEither<SyncException, LocalNodeChange> = (remote) =>
  flow(
    taskEither.of,
    taskEither.chainFirst(({ path }) =>
      pipe(
        path,
        findClosest((closestPath) =>
          pipe(
            remote,
            array.findFirst((i) => i.path === closestPath),
            option.map(isWritable),
          ),
        ),
        taskEither.filterOrElse(boolean.isTrue, () =>
          syncExceptionADT.wide.readOnlyFilesChanged({
            path,
            reason: 'Parent directory is read-only',
          }),
        ),
      ),
    ),
  );

const checkValidFileName: (
  c: LocalNodeChange,
) => taskEither.TaskEither<SyncException, LocalNodeChange> = flow(
  taskEither.of,
  taskEither.chainFirst(({ path }) =>
    pipe(
      libPath.basename(path),
      taskEither.fromTaskOption(() =>
        syncExceptionADT.wide.fileSystemCorrupted({
          path,
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
  (remote: Array<RemoteNodeInfo>) =>
  (change: LocalNodeChange): taskEither.TaskEither<SyncException, LocalNodeChange> => {
    const ancestors = (path: string): task.Task<Array<either.Either<SyncException, string>>> =>
      array.unfoldTaskK(
        either.of<SyncException, string>(path),
        flow(
          // if the previous call produced an error, do not continue
          taskOption.fromEither<string>,
          // tauri.path.dirname is silly and returns an error if passing '.' or '/', so we need to abort before that
          taskOption.filter((path) => path !== '.'),
          taskOption.chain((p) =>
            pipe(
              libPath.dirname(p),
              taskEither.mapLeft(({ message: reason }) =>
                syncExceptionADT.fileSystemCorrupted({ path: p, reason }),
              ),
              task.map((x) => option.of([x, x])),
            ),
          ),
        ),
      );

    const isExisting = (path: string) => remote.some((i) => i.path === path);
    const isNew = (path: string) => !isExisting(path);
    return pipe(
      ancestors(change.path),
      task.map(either.sequenceArray),
      taskEither.chain((paths) =>
        pipe(
          paths,
          array.filter(isNew),
          array.traverse(taskOption.ApplicativePar)(libPath.basename),
          taskOption.filter(array.every(isValidDirName)),
          taskEither.fromTaskOption(() =>
            syncExceptionADT.wide.fileSystemCorrupted({
              path: paths.join('/'),
              reason: 'Parent directory has invalid name',
            }),
          ),
        ),
      ),
      taskEither.map(() => change),
    );
  };

const isFileWritable =
  (remote: Array<RemoteNodeInfo>) =>
  (c: LocalNodeChange): boolean =>
    pipe(
      remote,
      array.findFirst((i) => i.path === c.path),
      option.fold(constFalse, isWritable),
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
const getFilesToUpload = (
  local: Array<LocalNodeChange>,
  remote: Array<RemoteNodeInfo>,
): taskEither.TaskEither<SyncException, Array<LocalNodeChange>> =>
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
      pipe(
        x,
        localChangeType.fold<
          (c: LocalNodeChange) => taskEither.TaskEither<SyncException, LocalNodeChange>
        >(x.change, {
          noChange: () => () => {
            panic('File has no changes');
          },
          added: () =>
            flow(
              checkClosestExistingAncestorIsWritable(remote),
              taskEither.chain(checkEveryNewAncestorIsValidDirName(remote)),
              taskEither.chainFirst(checkValidFileName),
            ),
          removed: () =>
            flow(
              taskEither.fromPredicate(isFileWritable(remote), () =>
                syncExceptionADT.readOnlyFilesChanged({ path: '', reason: 'File is read-only' }),
              ),
              taskEither.chain(checkClosestExistingAncestorIsWritable(remote)),
            ),
          updated: () =>
            taskEither.fromPredicate(isFileWritable(remote), () =>
              syncExceptionADT.readOnlyFilesChanged({ path: '', reason: 'File is read-only' }),
            ),
        }),
      ),
    ),
    taskEither.map(array.unsafeFromReadonly),
  );

const getFilesToDownload =
  (projectInfoRemote: Array<RemoteNodeInfo>) =>
  (remoteChanges: Array<RemoteNodeChange>): Array<RemoteNodeInfo> =>
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
          array.exists((file) => file.path === path),
        ),
      ),
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

export const uploadChangedFiles = (
  fileName: string,
  projectId: ProjectId,
  projectDir: string,
  localChanges: Array<LocalNodeChange>,
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
        libOs.tempDir,
        taskEither.getOrElse((e) => {
          throw e;
        }),
        task.chain((tempDir) => libPath.join(tempDir, fileName)),
      ),
    ),
    taskEither.bindTaskK('tarHash', ({ uploadFiles, archivePath }) =>
      api.buildTar(archivePath, projectDir, uploadFiles),
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
          : libFs.readBinaryFile(archivePath),
        taskEither.getOrElse((e) => {
          throw e;
        }),
      ),
    ),
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
  localChanges: option.Option<NonEmptyArray<LocalNodeChange>>;
  remoteChanges: option.Option<NonEmptyArray<RemoteNodeChange>>;
} & R): either.Either<SyncException, void> =>
  pipe(
    option.sequenceS({ local: localChanges, remote: remoteChanges }),
    option.chain(({ local, remote }) => getConflicts(local, remote)),
    option.fold(
      () => either.right(undefined),
      (conflicts) => {
        console.log(conflicts);
        return either.left(syncExceptionADT.conflictingChanges());
      },
    ),
  );

export type ForceSyncDirection = 'push' | 'pull';

export type RunProjectSync = (
  project: Project,
  options?: { force?: ForceSyncDirection },
) => taskEither.TaskEither<SyncException, void>;

const projectInfoStack: FileSystemStack = { ...libFs, ...libPath };

export const useProjectSync = () => {
  const time = useTimeContext();
  const { projectRepository } = useGlobalContext();

  return React.useCallback<RunProjectSync>(
    (project, { force } = {}) =>
      pipe(
        taskEither.Do,

        // setup
        taskEither.bind('rootDir', () =>
          pipe(
            api.settingRead('projectDir', iots.string),
            taskEither.fromTaskOption(() => syncExceptionADT.projectDirMissing()),
          ),
        ),
        taskEither.bindTaskK('projectDirRelative', () =>
          getProjectDirRelative(projectInfoStack)(project),
        ),
        taskEither.bindW('projectDir', ({ rootDir, projectDirRelative }) =>
          pipe(libPath.join(rootDir, projectDirRelative), taskEither.fromTask),
        ),
        // change detection
        taskEither.let('projectInfoPrevious', () =>
          pipe(
            projectPrism.local.getOption(project),
            option.map(({ value: { files } }) => files),
          ),
        ),
        taskEither.bindW('projectInfoRemote', () => getProjectInfoRemote(project.value.projectId)),
        taskEither.bind('projectInfoLocal', ({ projectDir }) =>
          pipe(
            projectPrism.local.getOption(project),
            option.traverse(taskEither.ApplicativePar)((project) =>
              getProjectInfoLocal(projectInfoStack)(projectDir, project),
            ),
          ),
        ),
        taskEither.let('remoteChanges', ({ projectInfoRemote, projectInfoPrevious }) =>
          pipe(
            projectInfoPrevious,
            option.fold(
              // the project has never been synced before
              () => getRemoteChanges([], projectInfoRemote.files),
              (previous) => getRemoteChanges(previous, projectInfoRemote.files),
            ),
            option.filter(() => force == null || force === 'pull'),
          ),
        ),
        taskEither.let('localChanges', ({ projectInfoLocal, projectInfoPrevious }) =>
          pipe(
            option.sequenceS({ local: projectInfoLocal, previous: projectInfoPrevious }),
            option.chain(({ local, previous }) => getLocalChanges(previous, local)),
            option.filter(() => force == null || force === 'push'),
          ),
        ),
        taskEither.chainFirstEitherKW(checkConflicts),
        taskEither.bind('filesToUpload', ({ localChanges, projectInfoRemote }) =>
          pipe(
            localChanges,
            option.traverse(taskEither.ApplicativePar)((changes) =>
              getFilesToUpload(changes, projectInfoRemote.files),
            ),
          ),
        ),
        taskEither.let('filesToDownload', ({ remoteChanges, projectInfoRemote }) =>
          pipe(remoteChanges, option.map(getFilesToDownload(projectInfoRemote.files))),
        ),
        taskEither.let('filesToDelete', ({ remoteChanges }) =>
          pipe(remoteChanges, option.map(getFilesToDelete)),
        ),
        // upload local changed files
        taskEither.chainFirst(({ projectDir, filesToUpload }) =>
          pipe(
            filesToUpload,
            option.fold(
              () => taskEither.of(undefined),
              (filesToUpload) =>
                uploadChangedFiles(
                  `project_${project.value.projectId}_${time.now().getTime()}.tar.br`,
                  project.value.projectId,
                  projectDir,
                  filesToUpload,
                ),
            ),
          ),
        ),
        // download and write added and updated files
        taskEither.chainFirst(({ filesToDownload, projectDir, projectInfoRemote }) =>
          pipe(
            projectInfoRemote.files,
            array.filter(isDir),
            array.sort(
              ord.contramap((dir: { path: string }) => dir.path.split('/').length)(number.Ord),
            ),
            array.traverse(taskEither.ApplicativeSeq)(updateDir(projectDir)),
            taskEither.chain(() =>
              pipe(
                filesToDownload,
                option.foldW(
                  () => taskEither.of<SyncException, void>(undefined),
                  (filesToDownload) =>
                    pipe(
                      filesToDownload,
                      array.traverse(taskEither.ApplicativeSeq)((fileInfo) =>
                        writeSingleFile({
                          fileInfo,
                          projectId: project.value.projectId,
                          projectDir,
                        }),
                      ),
                      taskEither.map(constVoid),
                    ),
                ),
              ),
            ),
          ),
        ),
        //delete remote removed files
        taskEither.chainFirstTaskK(({ filesToDelete, projectDir }) =>
          pipe(
            filesToDelete,
            option.foldW(
              () => task.of(undefined),
              (filesToDelete) =>
                pipe(
                  filesToDelete,
                  array.traverse(task.ApplicativeSeq)(
                    deleteSingleFile(projectInfoStack, projectDir),
                  ),
                ),
            ),
          ),
        ),
        // update all project metadata
        taskEither.bindW('updatedProjectInfo', ({ projectDir }) =>
          pipe(
            getProjectInfoRemote(project.value.projectId),
            taskEither.chainW((projectInfoRemote) =>
              pipe(
                projectInfoRemote.files,
                array.filter(isFile),
                array.traverse(task.ApplicativeSeq)(
                  fromRemoteFileInfo(projectInfoStack, projectDir),
                ),
                task.map((files) => ({
                  ...projectInfoRemote,
                  files,
                })),
                taskEither.fromTask,
              ),
            ),
          ),
        ),
        // store new state
        taskEither.chainFirstTaskK(({ updatedProjectInfo, projectDirRelative }) =>
          projectRepository.upsertOne(
            projectADT.local({
              ...project.value,
              files: updatedProjectInfo.files,
              basePath: projectDirRelative,
              syncedAt: time.now(),
              syncState: projectADT.fold(project, {
                remote: () => syncStateADT.synced(changesADT.unknown()),
                local: ({ syncState }) => syncState,
              }),
            }),
          ),
        ),
        taskEither.map(constVoid),
      ),
    [projectRepository, time],
  );
};
