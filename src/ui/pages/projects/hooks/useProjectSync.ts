import { fs, path as tauriPath } from '@tauri-apps/api';
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
  task,
  taskEither,
  taskOption,
  tree,
} from '@code-expert/prelude';
import {
  FileEntryType,
  FileEntryTypeC,
  FilePermissions,
  FilePermissionsC,
  ProjectId,
  ProjectMetadata,
  readProjectConfig,
  writeProjectConfig,
} from '@/domain/Project';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';
import { Exception, fromError, invariantViolated } from '@/domain/exception';
import { pathEscape } from '@/utils/pathEscape';

const pathJoin = taskEither.tryCatchK(tauriPath.join, fromError);

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
    taskEither.bind('systemFilePath', () => pathJoin(projectDir, projectFilePath)),
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
      pathJoin(projectDir, path),
      taskEither.chain(api.getFileHash),
      taskEither.map((hash) => ({ path, type, hash })),
    );

const isFile = <E extends { type: FileEntryType }>(e: E): e is E & { type: 'file' } =>
  e.type === 'file';

const getProjectInfoLocal = (
  projectDir: string,
): taskEither.TaskEither<Exception, option.Option<Array<LocalFileState>>> =>
  pipe(
    taskOption.tryCatch(() => fs.readDir(projectDir, { recursive: true })),
    taskOption.map(
      flow(
        (files) =>
          tree.make<{ path: string; type: FileEntryType }>(
            { path: projectDir, type: 'dir' },
            tree.unfoldForest(files, ({ path, children }) => [
              { path, type: children == null ? 'file' : 'dir' },
              children ?? [],
            ]),
          ),
        tree.map(({ path, type }) => ({
          path: `.${path.slice(projectDir.length)}`,
          type,
        })),
        tree.foldMap(array.getMonoid<{ path: string; type: 'file' }>())((entry) =>
          isFile(entry) ? array.of(entry) : [],
        ),
      ),
    ),
    task.chain(
      option.traverse(taskEither.ApplicativePar)(
        flow(
          taskEither.traverseArray(addHash(projectDir)),
          taskEither.map(array.unsafeFromReadonly),
        ),
      ),
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
    monoid.concatAll(array.getMonoid<RemoteFileChange>()),
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
    monoid.concatAll(array.getMonoid<LocalFileChange>()),
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

const getPreviousProjectInfo = (projectId: ProjectId, projectDir: string) =>
  pipe(
    readProjectConfig(projectId),
    taskOption.filter((e) => e.dir === projectDir),
  );

export const useProjectSync = () =>
  React.useCallback(
    (project: ProjectMetadata) =>
      pipe(
        taskEither.Do,
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
        taskEither.bind('projectDir', ({ rootDir }) =>
          pathJoin(
            rootDir,
            pathEscape(project.semester),
            pathEscape(project.courseName),
            pathEscape(project.exerciseName),
            pathEscape(project.taskName),
          ),
        ),
        taskEither.bindTaskK('projectInfoPrevious', ({ projectDir }) =>
          getPreviousProjectInfo(project.projectId, projectDir),
        ),
        taskEither.bind('projectInfoRemote', () => getProjectInfoRemote(project.projectId)),
        taskEither.bindW('projectInfoLocal', ({ projectDir }) => getProjectInfoLocal(projectDir)),
        taskEither.let('remoteChanges', ({ projectInfoRemote, projectInfoPrevious }) =>
          pipe(
            projectInfoPrevious,
            option.chain((previous) => getRemoteChanges(previous.files, projectInfoRemote.files)),
          ),
        ),
        taskEither.let('localChanges', ({ projectInfoLocal, projectInfoPrevious }) =>
          pipe(
            option.sequenceS({ local: projectInfoLocal, previous: projectInfoPrevious }),
            option.chain(({ local, previous }) => getLocalChanges(previous.files, local)),
          ),
        ),
        taskEither.chainFirstW(({ projectDir }) => api.createProjectDir(projectDir)),
        taskEither.bind('updatedProjectInfo', ({ projectInfoRemote, projectDir }) =>
          pipe(
            projectInfoRemote.files,
            array.filter((f) => f.type === 'file'),
            taskEither.traverseSeqArray(({ path, permissions, type, version }) =>
              writeSingeFile({
                projectFilePath: path,
                projectId: project.projectId,
                projectDir,
                type,
                version,
                permissions,
              }),
            ),
            taskEither.map(array.unsafeFromReadonly),
          ),
        ),
        taskEither.chainFirstTaskK(({ updatedProjectInfo, projectDir }) =>
          writeProjectConfig(project.projectId, {
            files: updatedProjectInfo,
            dir: projectDir,
          }),
        ),
      ),
    [],
  );
