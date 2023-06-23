import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';
import {
  array,
  boolean,
  constFalse,
  constTrue,
  either,
  eq,
  flow,
  iots,
  monoid,
  nonEmptyArray,
  option,
  pipe,
  string,
  tagged,
  task,
  taskEither,
  taskOption,
  tree,
} from '@code-expert/prelude';
import {
  FileEntryType,
  FileEntryTypeC,
  File as FileInfo,
  FilePermissions,
  FilePermissionsC,
  isFile,
  isValidDirName,
  isValidFileName,
} from '@/domain/File';
import { LocalProject, Project, ProjectId, projectADT, projectPrism } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { createSignedAPIRequest, requestBody } from '@/domain/createAPIRequest';
import { Exception, invariantViolated } from '@/domain/exception';
import { fs as libFs, os as libOs, path as libPath } from '@/lib/tauri';
import { removeFile } from '@/lib/tauri/fs';
import { useGlobalContext } from '@/ui/GlobalContext';
import { useTimeContext } from '@/ui/contexts/TimeContext';

function writeSingeFile({
  projectFilePath,
  projectId,
  projectDir,
  version,
  permissions,
  type,
}: {
  projectFilePath: string;
  projectId: ProjectId;
  projectDir: string;
  version: number;
  permissions: FilePermissions;
  type: FileEntryType;
}) {
  return pipe(
    taskEither.Do,
    taskEither.bind('systemFilePath', () => libPath.join(projectDir, projectFilePath)),
    taskEither.chainFirst(({ systemFilePath }) =>
      pipe(
        api.createProjectDir(projectDir),
        taskEither.fromTaskOption(() => invariantViolated('Project dir could not be created')),
        taskEither.chain(() =>
          createSignedAPIRequest({
            path: `project/${projectId}/file`,
            method: 'GET',
            jwtPayload: { path: projectFilePath },
            codec: iots.string,
            responseType: ResponseType.Text,
          }),
        ),
        taskEither.chainW((fileContent) =>
          api.writeProjectFile(systemFilePath, fileContent, permissions === 'r'),
        ),
      ),
    ),
    taskEither.bindW('hash', ({ systemFilePath }) => api.getFileHash(systemFilePath)),
    taskEither.map(({ hash }) => ({
      path: projectFilePath,
      version,
      hash,
      type,
      permissions,
    })),
  );
}

function deleteSingeFile({
  projectFilePath,
  projectDir,
}: {
  projectFilePath: string;
  projectDir: string;
}) {
  return pipe(libPath.join(projectDir, projectFilePath), taskEither.chainFirst(removeFile));
}

const addHash =
  (projectDir: string) =>
  ({ path, type }: { path: string; type: 'file' }) =>
    pipe(
      libPath.join(projectDir, path),
      taskEither.chain(api.getFileHash),
      taskEither.map((hash) => ({ path, type, hash })),
    );

const getProjectFilesLocal = (
  projectDir: string,
): taskEither.TaskEither<Exception, ReadonlyArray<{ path: string; type: 'file' }>> =>
  pipe(
    libFs.readDirTree(projectDir),
    taskEither.map(
      flow(
        tree.foldMap(array.getMonoid<{ path: string; type: FileEntryType }>())(array.of),
        array.filter(isFile),
      ),
    ),
    taskEither.chain(
      taskEither.traverseArray(({ path, type }) =>
        pipe(
          libPath.stripAncestor(projectDir)(path),
          taskEither.map((relative) => ({
            path: relative,
            type,
          })),
        ),
      ),
    ),
  );

/**
 * Possible Exceptions:
 * - has been synced before, but dir not present
 * - can't read dir or subdir
 *
 * By requiring {@link LocalProject} we have handled case 1. Case 2 & 3 are textbook exception, no need to differentiate
 */
const getProjectInfoLocal = (
  projectDir: string,
  _: LocalProject,
): taskEither.TaskEither<Exception, Array<LocalFileState>> =>
  pipe(
    getProjectFilesLocal(projectDir),
    taskEither.chain(
      flow(taskEither.traverseArray(addHash(projectDir)), taskEither.map(array.unsafeFromReadonly)),
    ),
  );

interface RemoteFileState {
  path: string;
  type: FileEntryType;
  version: number;
}

interface RemoteFileChange {
  path: string;
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated', number>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added', number>;
}

const remoteFileChange = tagged.build<RemoteFileChange['change']>();

interface LocalFileState {
  path: string;
  type: FileEntryType;
  hash: string;
}

interface LocalFileChange {
  path: string;
  change:
    | tagged.Tagged<'noChange'>
    | tagged.Tagged<'updated'>
    | tagged.Tagged<'removed'>
    | tagged.Tagged<'added'>;
}

interface Conflict {
  path: string;
  changeRemote: RemoteFileChange['change'];
  changeLocal: LocalFileChange['change'];
}

const localFileChange = tagged.build<LocalFileChange['change']>();

const eqPath = eq.struct({
  path: string.Eq,
});

const getRemoteChanges = (
  previous: Array<RemoteFileState>,
  latest: Array<RemoteFileState>,
): option.Option<NonEmptyArray<RemoteFileChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<RemoteFileChange> = pipe(
    previousFiles,
    array.difference<RemoteFileState>(eqPath)(latestFiles),
    array.map(({ path }) => ({ path, change: remoteFileChange.removed() })),
  );
  const added: Array<RemoteFileChange> = pipe(
    latestFiles,
    array.difference<RemoteFileState>(eqPath)(previousFiles),
    array.map(({ path, version }) => ({ path, change: remoteFileChange.added(version) })),
  );
  const updated: Array<RemoteFileChange> = pipe(
    previousFiles,
    array.filter((ls) =>
      pipe(
        latestFiles,
        array.findFirst((cs) => cs.path === ls.path),
        option.exists((cs) => cs.version !== ls.version),
      ),
    ),
    array.map(({ path, version }) => ({ path, change: remoteFileChange.updated(version) })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

const getLocalChanges = (
  previous: Array<FileInfo>,
  latest: Array<LocalFileState>,
): option.Option<NonEmptyArray<LocalFileChange>> => {
  const previousFiles = pipe(previous, array.filter(isFile));
  const latestFiles = pipe(latest, array.filter(isFile));
  const removed: Array<LocalFileChange> = pipe(
    previousFiles,
    array.difference<LocalFileState>(eqPath)(latestFiles),
    array.map(({ path }) => ({ path, change: localFileChange.removed() })),
  );
  const added: Array<LocalFileChange> = pipe(
    latestFiles,
    array.difference<LocalFileState>(eqPath)(previousFiles),
    array.map(({ path }) => ({ path, change: localFileChange.added() })),
  );
  const updated: Array<LocalFileChange> = pipe(
    previousFiles,
    array.bindTo('previous'),
    array.bind('latest', ({ previous }) =>
      pipe(
        latestFiles,
        array.findFirst((latest) => eqPath.equals(previous, latest)),
        option.fold(() => [], array.of),
      ),
    ),
    array.filter(({ latest, previous }) => latest.hash !== previous.hash),
    array.map(({ latest: { path } }) => ({
      path,
      change: localFileChange.updated(),
    })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

const getConflicts = (
  local: NonEmptyArray<LocalFileChange>,
  remote: NonEmptyArray<RemoteFileChange>,
): option.Option<NonEmptyArray<Conflict>> => {
  const conflicts: Array<Conflict> = pipe(
    local,
    array.intersection<LocalFileChange>(eqPath)(remote),
    array.map((changeLocal) => ({
      path: changeLocal.path,
      changeLocal: changeLocal.change,
      changeRemote: pipe(
        remote,
        array.findFirst((changeRemote) => eqPath.equals(changeLocal, changeRemote)),
        option.map(({ change }) => change),
        option.getOrElseW(() => remoteFileChange.noChange()),
      ),
    })),
  );
  return pipe(conflicts, nonEmptyArray.fromArray);
};

const RemoteFileInfoC = iots.strict({
  path: iots.string,
  version: iots.number,
  type: FileEntryTypeC,
  permissions: FilePermissionsC,
});
type RemoteFileInfo = iots.TypeOf<typeof RemoteFileInfoC>;
const getProjectInfoRemote = (projectId: ProjectId) =>
  createSignedAPIRequest({
    path: `project/${projectId}/info`,
    method: 'GET',
    jwtPayload: {},
    codec: iots.strict({
      _id: ProjectId,
      files: iots.array(RemoteFileInfoC),
    }),
  });

const getProjectDirRelative = ({ semester, courseName, exerciseName, taskName }: ProjectMetadata) =>
  libPath.join(
    libPath.escape(semester),
    libPath.escape(courseName),
    libPath.escape(exerciseName),
    libPath.escape(taskName),
  );

const findClosest =
  <A>(map: (path: string) => option.Option<A>) =>
  (relPath: string): taskEither.TaskEither<Exception, A> =>
    pipe(
      map(relPath),
      option.fold(
        () =>
          relPath === '.'
            ? taskEither.left(invariantViolated('Root directory must exist'))
            : pipe(libPath.dirname(relPath), taskEither.chain(findClosest(map))),
        taskEither.of,
      ),
    );

const checkClosestExistingAncestorIsWritable =
  (remote: Array<RemoteFileInfo>) =>
  (c: LocalFileChange): taskEither.TaskEither<Exception, LocalFileChange> =>
    pipe(
      c.path,
      findClosest((path) =>
        pipe(
          remote,
          array.findFirst((i) => i.path === path),
          option.map((i) => i.permissions === 'rw'),
        ),
      ),
      taskEither.chainW(
        boolean.fold(
          () => taskEither.left(invariantViolated('Parent directory is read-only')),
          () => taskEither.of(c),
        ),
      ),
    );

const checkValidFileName = (c: LocalFileChange) =>
  pipe(
    libPath.basename(c.path),
    taskEither.filterOrElseW(isValidFileName, () => invariantViolated('Invalid file name')),
  );

const checkEveryNewAncestorIsValidDirName =
  (remote: Array<RemoteFileInfo>) =>
  (change: LocalFileChange): taskEither.TaskEither<Exception, LocalFileChange> => {
    const ancestors = (path: string): task.Task<Array<either.Either<Exception, string>>> =>
      array.unfoldTaskK(
        either.of<Exception, string>(path),
        flow(
          // if the previous call produced an error, do not continue
          taskOption.fromEither<string>,
          // tauri.path.dirname is silly and returns an error if passing '.' or '/', so we need to abort before that
          taskOption.filter((path) => path !== '.'),
          taskOption.chain(
            flow(
              libPath.dirname,
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
      taskEither.chain(
        flow(
          array.filter(isNew),
          array.traverse(taskEither.ApplicativePar)(libPath.basename),
          taskEither.filterOrElse(
            array.every(isValidDirName),
            (): Exception => invariantViolated('Parent directory has invalid name'),
          ),
        ),
      ),
      taskEither.map(() => change),
    );
  };

const isFileWritable =
  (remote: Array<RemoteFileInfo>) =>
  (c: LocalFileChange): boolean =>
    pipe(
      remote,
      array.findFirst((i) => i.path === c.path),
      option.fold(constFalse, (i) => i.permissions === 'rw'),
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
const getFilesToUpload = (local: Array<LocalFileChange>, remote: Array<RemoteFileInfo>) =>
  pipe(
    local,
    array.filter((c) =>
      localFileChange.fold(c.change, {
        noChange: constFalse,
        added: constTrue,
        removed: constTrue,
        updated: constTrue,
      }),
    ),
    taskEither.traverseArray((x) =>
      pipe(
        x,
        localFileChange.fold<
          (c: LocalFileChange) => taskEither.TaskEither<Exception, LocalFileChange>
        >(x.change, {
          noChange: () => () => taskEither.left(invariantViolated('File has no changes')),
          added: () =>
            flow(
              checkClosestExistingAncestorIsWritable(remote),
              taskEither.chain(checkEveryNewAncestorIsValidDirName(remote)),
              taskEither.chainFirst(checkValidFileName),
            ),
          removed: () =>
            flow(
              taskEither.fromPredicate(isFileWritable(remote), () =>
                invariantViolated('File is read-only'),
              ),
              taskEither.chain(checkClosestExistingAncestorIsWritable(remote)),
            ),
          updated: () =>
            taskEither.fromPredicate(isFileWritable(remote), () =>
              invariantViolated('File is read-only'),
            ),
        }),
      ),
    ),
    taskEither.map(array.unsafeFromReadonly),
  );

const getFilesToDownload =
  (projectInfoRemote: Array<RemoteFileInfo>) =>
  (remoteChanges: Array<RemoteFileChange>): Array<RemoteFileInfo> =>
    pipe(
      projectInfoRemote,
      array.filter(({ path }) =>
        pipe(
          remoteChanges,
          array.filter((c) =>
            remoteFileChange.fold(c.change, {
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

const getFilesToDelete = (remoteChanges: Array<RemoteFileChange>): Array<RemoteFileChange> =>
  pipe(
    remoteChanges,
    array.filter((c) =>
      remoteFileChange.fold(c.change, {
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
  localChanges: Array<LocalFileChange>,
): taskEither.TaskEither<Exception, unknown> =>
  pipe(
    taskEither.Do,
    taskEither.let('uploadFiles', () =>
      pipe(
        localChanges,
        array.filter((c) =>
          localFileChange.fold(c.change, {
            noChange: constFalse,
            added: constTrue,
            removed: constFalse,
            updated: constTrue,
          }),
        ),
        array.map(({ path }) => path),
      ),
    ),
    taskEither.bind('archivePath', () =>
      pipe(
        libOs.tempDir(),
        taskEither.chain((tempDir) => libPath.join(tempDir, fileName)),
        taskEither.map((e) => {
          console.log(e);
          return e;
        }),
      ),
    ),
    taskEither.bind('tarHash', ({ uploadFiles, archivePath }) =>
      api.buildTar(archivePath, projectDir, uploadFiles),
    ),
    taskEither.let('removeFiles', () =>
      pipe(
        localChanges,
        array.filter((c) =>
          localFileChange.fold(c.change, {
            noChange: constFalse,
            added: constFalse,
            removed: constTrue,
            updated: constFalse,
          }),
        ),
        array.map(({ path }) => path),
      ),
    ),
    taskEither.bind('body', ({ uploadFiles, archivePath }) =>
      array.isEmpty(uploadFiles)
        ? taskEither.of(new Uint8Array())
        : libFs.readBinaryFile(archivePath),
    ),
    taskEither.chain(({ body, tarHash, removeFiles, uploadFiles }) =>
      createSignedAPIRequest({
        method: 'POST',
        path: `project/${projectId}/files`,
        jwtPayload: array.isEmpty(uploadFiles) ? { removeFiles } : { tarHash, removeFiles },
        body: requestBody.binary({
          body,
          type: 'application/x-tar',
          encoding: option.some('br'),
        }),
        codec: iots.strict({
          _id: ProjectId,
          files: iots.array(RemoteFileInfoC),
        }),
      }),
    ),
  );

const checkConflicts = <R>({
  localChanges,
  remoteChanges,
}: {
  localChanges: option.Option<NonEmptyArray<LocalFileChange>>;
  remoteChanges: option.Option<NonEmptyArray<RemoteFileChange>>;
} & R): either.Either<Exception, void> =>
  pipe(
    option.sequenceS({ local: localChanges, remote: remoteChanges }),
    option.chain(({ local, remote }) => getConflicts(local, remote)),
    option.fold(
      () => either.right(undefined),
      (conflicts) => {
        console.log(conflicts);
        return either.left(invariantViolated('Conflicts are not yet handled'));
      },
    ),
  );

export const useProjectSync = () => {
  const time = useTimeContext();
  const { projectRepository } = useGlobalContext();

  return React.useCallback(
    (project: Project): taskEither.TaskEither<Exception, unknown> =>
      pipe(
        taskEither.Do,

        // setup
        taskEither.bind('rootDir', () =>
          pipe(
            api.settingRead('projectDir', iots.string),
            taskEither.fromTaskOption(() =>
              invariantViolated(
                'No project dir was found. Have you chosen a directory in the settings?',
              ),
            ),
          ),
        ),
        // This is where it *should* be
        taskEither.bind('projectDirRelative', () =>
          projectADT.fold(project, {
            remote: (metadata) => getProjectDirRelative(metadata),
            local: ({ basePath }) => taskEither.of(basePath),
          }),
        ),
        taskEither.bind('projectDir', ({ rootDir, projectDirRelative }) =>
          libPath.join(rootDir, projectDirRelative),
        ),
        // change detection
        taskEither.let('projectInfoPrevious', () =>
          pipe(
            projectPrism.local.getOption(project),
            option.map(({ value: { files } }) => files),
          ),
        ),
        taskEither.bind('projectInfoRemote', () => getProjectInfoRemote(project.value.projectId)),
        taskEither.bind('projectInfoLocal', ({ projectDir }) =>
          pipe(
            projectPrism.local.getOption(project),
            option.traverse(taskEither.ApplicativePar)((project) =>
              getProjectInfoLocal(projectDir, project),
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
          ),
        ),
        taskEither.let('localChanges', ({ projectInfoLocal, projectInfoPrevious }) =>
          pipe(
            option.sequenceS({ local: projectInfoLocal, previous: projectInfoPrevious }),
            option.chain(({ local, previous }) => getLocalChanges(previous, local)),
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
        taskEither.chainFirst(({ filesToDownload, projectDir }) =>
          pipe(
            filesToDownload,
            option.foldW(
              () => taskEither.of(undefined),
              (filesToDownload) =>
                pipe(
                  filesToDownload,
                  array.traverse(taskEither.ApplicativeSeq)(
                    ({ path, permissions, type, version }) =>
                      writeSingeFile({
                        projectFilePath: path,
                        projectId: project.value.projectId,
                        projectDir,
                        type,
                        version,
                        permissions,
                      }),
                  ),
                ),
            ),
          ),
        ),
        //delete remote removed files
        taskEither.chainFirst(({ filesToDelete, projectDir }) =>
          pipe(
            filesToDelete,
            option.foldW(
              () => taskEither.of(undefined),
              (filesToDelete) =>
                pipe(
                  filesToDelete,
                  array.traverse(taskEither.ApplicativeSeq)(({ path }) =>
                    deleteSingeFile({
                      projectFilePath: path,
                      projectDir,
                    }),
                  ),
                ),
            ),
          ),
        ),
        // update all project metadata
        taskEither.bind('updatedProjectInfo', ({ projectDir }) => {
          const hashF = addHash(projectDir);
          return pipe(
            getProjectInfoRemote(project.value.projectId),
            taskEither.chain((projectInfoRemote) =>
              pipe(
                projectInfoRemote.files,
                array.filter(isFile),
                array.traverse(taskEither.ApplicativeSeq)((file) =>
                  pipe(
                    hashF({ path: file.path, type: 'file' }),
                    taskEither.map(({ hash }) => ({ ...file, hash })),
                  ),
                ),
                taskEither.map((files) => ({
                  ...projectInfoRemote,
                  files,
                })),
              ),
            ),
          );
        }),
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
      ),
    [projectRepository, time],
  );
};
