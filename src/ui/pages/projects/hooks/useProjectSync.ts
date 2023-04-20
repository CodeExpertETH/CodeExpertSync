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
  taskOption,
  tree,
} from '@code-expert/prelude';
import { fs, path } from '@tauri-apps/api';
import { ResponseType } from '@tauri-apps/api/http';
import { api } from 'api';
import React from 'react';

import { ProjectId } from '../../../../domain/Project';
import { createSignedAPIRequest } from '../../../../domain/createAPIRequest';
import { Exception, fromError, invariantViolated } from '../../../../domain/exception';

const pathJoin = taskEither.tryCatchK(path.join, fromError);

const FilePermissionsC = iots.keyof({ r: null, rw: null });
type FilePermissions = iots.TypeOf<typeof FilePermissionsC>;

const FileEntryTypeC = iots.keyof({ file: null, dir: null });
type FileEntryType = iots.TypeOf<typeof FileEntryTypeC>;

const ProjectConfigC = iots.strict({
  dir: iots.string,
  files: iots.array(
    iots.strict({
      path: iots.string,
      version: iots.number,
      hash: iots.string,
      type: FileEntryTypeC,
      permissions: FilePermissionsC,
    }),
  ),
});
type ProjectConfig = iots.TypeOf<typeof ProjectConfigC>;

const readProjectConfig = (projectId: ProjectId) =>
  api.readConfigFile(`project_${projectId}.json`, ProjectConfigC);

const writeProjectConfig = (projectId: ProjectId, projectConfig: Readonly<ProjectConfig>) =>
  api.writeConfigFile(`project_${projectId}.json`, projectConfig);

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
    taskEither.chainFirst(() =>
      createSignedAPIRequest({
        path: `project/${projectId}/file`,
        method: 'GET',
        payload: { path: projectFilePath },
        codec: iots.string,
        responseType: ResponseType.Text,
      }),
    ),
    taskEither.bindW('hash', ({ systemFilePath }) => api.getFileHash(systemFilePath)),
    taskEither.map(({ systemFilePath, hash }) => ({
      path: systemFilePath,
      version,
      hash,
      type,
      permissions,
    })),
  );
}

const getProjectInfoLocal = (
  projectDir: string,
): taskEither.TaskEither<Exception, Array<LocalFileState>> =>
  pipe(
    taskEither.tryCatch(() => fs.readDir(projectDir), fromError),
    taskEither.map(
      flow(
        (files) =>
          tree.make(
            { path: projectDir, type: 'dir' },
            tree.unfoldForest(files, ({ path, children }) => [
              { path, type: children == null ? 'dir' : 'file' },
              children ?? [],
            ]),
          ),
        tree.foldMap(array.getMonoid<{ path: string }>())((entry) =>
          entry.type === 'file' ? array.of(entry) : [],
        ),
      ),
    ),
    taskEither.chain(
      taskEither.traverseArray(({ path }) =>
        pipe(
          api.getFileHash(path),
          taskEither.map((hash) => ({ path, hash })),
        ),
      ),
    ),
    taskEither.map(array.unsafeFromReadonly),
  );

interface RemoteFileState {
  path: string;
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
  const removed: Array<RemoteFileChange> = pipe(
    previous,
    array.difference<RemoteFileState>(eqPath)(latest),
    array.map(({ path }) => ({ path, change: remoteFileChange.removed() })),
  );
  const added: Array<RemoteFileChange> = pipe(
    latest,
    array.difference<RemoteFileState>(eqPath)(previous),
    array.map(({ path, version }) => ({ path, change: remoteFileChange.added(version) })),
  );
  const updated: Array<RemoteFileChange> = pipe(
    previous,
    array.filter((ls) =>
      pipe(
        latest,
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
  const removed: Array<LocalFileChange> = pipe(
    previous,
    array.difference<LocalFileState>(eqPath)(latest),
    array.map(({ path }) => ({ path, change: localFileChange.removed() })),
  );
  const added: Array<LocalFileChange> = pipe(
    latest,
    array.difference<LocalFileState>(eqPath)(previous),
    array.map(({ path }) => ({ path, change: localFileChange.added() })),
  );
  const updated: Array<LocalFileChange> = pipe(
    previous,
    array.filter((ls) =>
      pipe(
        latest,
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
    (projectId: ProjectId, projectName: string) =>
      pipe(
        taskEither.Do,
        taskEither.bind('projectDir', () =>
          pipe(
            api.settingRead('projectDir', iots.string),
            taskEither.fromTaskOption(() =>
              invariantViolated(
                'No project dir was found. Have you chosen a directory in the settings?',
              ),
            ),
            taskEither.chain((projectDir) => pathJoin(projectDir, projectName)),
          ),
        ),
        taskEither.bindTaskK('projectInfoPrevious', ({ projectDir }) =>
          getPreviousProjectInfo(projectId, projectDir),
        ),
        taskEither.bind('projectInfoRemote', () => getProjectInfoRemote(projectId)),
        taskEither.bindW('projectInfoLocal', ({ projectDir }) => getProjectInfoLocal(projectDir)),
        taskEither.let('remoteChanges', ({ projectInfoRemote, projectInfoPrevious }) =>
          pipe(
            projectInfoPrevious,
            option.chain((previous) => getRemoteChanges(previous.files, projectInfoRemote.files)),
          ),
        ),
        taskEither.let('localChanges', ({ projectInfoLocal, projectInfoPrevious }) =>
          pipe(
            projectInfoPrevious,
            option.chain((previous) => getLocalChanges(previous.files, projectInfoLocal)),
          ),
        ),
        taskEither.bind('updatedProjectInfo', ({ projectInfoRemote, projectDir }) =>
          pipe(
            projectInfoRemote.files,
            taskEither.traverseSeqArray(({ path, permissions, type, version }) =>
              writeSingeFile({
                projectFilePath: path,
                projectId,
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
          writeProjectConfig(projectId, {
            files: updatedProjectInfo,
            dir: projectDir,
          }),
        ),
      ),
    [],
  );
