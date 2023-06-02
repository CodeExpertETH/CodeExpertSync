import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';
import {
  array,
  eq,
  flow,
  iots,
  monoid,
  nonEmptyArray,
  option,
  pipe,
  string,
  tagged,
  taskEither,
  tree,
} from '@code-expert/prelude';
import { FileEntryType, FileEntryTypeC, FilePermissions, FilePermissionsC } from '@/domain/File';
import { LocalProject, Project, ProjectId, projectADT, projectPrism } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { changesADT, syncStateADT } from '@/domain/SyncState';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception, invariantViolated } from '@/domain/exception';
import { fs as libFs, path as libPath } from '@/lib/tauri';
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
        createSignedAPIRequest({
          path: `project/${projectId}/file`,
          method: 'GET',
          payload: { path: projectFilePath },
          codec: iots.string,
          responseType: ResponseType.Text,
        }),
        taskEither.chainW((fileContent) => api.writeFile(systemFilePath, fileContent)),
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

const addHash =
  (projectDir: string) =>
  ({ path, type }: { path: string; type: 'file' }) =>
    pipe(
      libPath.join(projectDir, path),
      taskEither.chain(api.getFileHash),
      taskEither.map((hash) => ({ path, type, hash })),
    );

const isFile = <E extends { type: FileEntryType }>(e: E): e is E & { type: 'file' } =>
  e.type === 'file';

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

const localFileChange = tagged.build<LocalFileChange['change']>();

const eqPath = eq.struct({
  path: string.Eq,
});

const getRemoteChanges = (
  previous: Array<RemoteFileState>,
  latest: Array<RemoteFileState>,
): option.Option<NonEmptyArray<RemoteFileChange>> => {
  const previousFiles = pipe(
    previous,
    array.filter((e) => e.type === 'file'),
  );
  const latestFiles = pipe(
    latest,
    array.filter((e) => e.type === 'file'),
  );
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
  previous: Array<LocalFileState>,
  latest: Array<LocalFileState>,
): option.Option<NonEmptyArray<LocalFileChange>> => {
  const previousFiles = pipe(
    previous,
    array.filter((e) => e.type === 'file'),
  );
  const latestFiles = pipe(
    latest,
    array.filter((e) => e.type === 'file'),
  );
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
    array.filter((ls) =>
      pipe(
        latestFiles,
        array.findFirst((cs) => cs.path === ls.path),
        option.exists((cs) => cs.hash !== ls.hash),
      ),
    ),
    array.map(({ path }) => ({ path, change: localFileChange.updated() })),
  );
  return pipe(
    [removed, added, updated],
    monoid.concatAll(array.getMonoid()),
    nonEmptyArray.fromArray,
  );
};

const getProjectInfoRemote = (projectId: ProjectId) =>
  createSignedAPIRequest({
    path: `project/${projectId}/info`,
    method: 'GET',
    payload: {},
    codec: iots.strict({
      _id: ProjectId,
      files: iots.array(
        iots.strict({
          path: iots.string,
          version: iots.number,
          type: FileEntryTypeC,
          permissions: FilePermissionsC,
        }),
      ),
    }),
  });

const getProjectDirRelative = ({ semester, courseName, exerciseName, taskName }: ProjectMetadata) =>
  libPath.join(
    libPath.escape(semester),
    libPath.escape(courseName),
    libPath.escape(exerciseName),
    libPath.escape(taskName),
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
            local: ({ dir }) => taskEither.of(dir),
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
            option.chain((previous) => getRemoteChanges(previous, projectInfoRemote.files)),
          ),
        ),
        taskEither.let('localChanges', ({ projectInfoLocal, projectInfoPrevious }) =>
          pipe(
            option.sequenceS({ local: projectInfoLocal, previous: projectInfoPrevious }),
            option.chain(({ local, previous }) => getLocalChanges(previous, local)),
          ),
        ),

        // syncing
        // -> up
        // TODO
        // -> down
        taskEither.chainFirst(({ projectDir }) => api.createProjectDir(projectDir)),
        taskEither.bind('updatedProjectInfo', ({ projectInfoRemote, projectDir }) =>
          pipe(
            projectInfoRemote.files,
            array.filter((f) => f.type === 'file'),
            taskEither.traverseSeqArray(({ path, permissions, type, version }) =>
              writeSingeFile({
                projectFilePath: path,
                projectId: project.value.projectId,
                projectDir,
                type,
                version,
                permissions,
              }),
            ),
            taskEither.map(array.unsafeFromReadonly),
          ),
        ),

        // store new state
        taskEither.chainFirstTaskK(({ updatedProjectInfo, projectDirRelative }) =>
          projectRepository.upsertOne(
            projectADT.local({
              ...project.value,
              files: updatedProjectInfo,
              dir: projectDirRelative,
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
