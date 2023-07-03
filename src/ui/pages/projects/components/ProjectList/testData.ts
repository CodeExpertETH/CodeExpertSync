import { constVoid, task, taskEither } from '@code-expert/prelude';
import { ProjectId, projectADT } from '@/domain/Project';
import { ProjectMetadata } from '@/domain/ProjectMetadata';
import { SyncException, changesADT, syncStateADT } from '@/domain/SyncState';

const metadata: ProjectMetadata = {
  projectId: 'p1' as ProjectId,
  semester: 'SS23',
  taskOrder: 1,
  exerciseOrder: 1,
  courseName: 'Erdwissenschaftliche Datenanalyse und Visualisierung',
  exerciseName: 'Exercise 8: Two-Dimensional vectors, Characters, Recursion',
  taskName: '03 / Teil C.4: Testen einer Hypothese mittels DNA-Sequenzanalyse',
  projectName: '03 / Teil C.4: Testen einer Hypothese mittels DNA-Sequenzanalyse - Student attempt',
};

export const remoteProject = projectADT.remote(metadata);

export const localProject = projectADT.local({
  ...metadata,
  basePath: '/tmp/cxexample',
  files: [],
  syncedAt: new Date('2023-05-06T11:00:00Z'),
  syncState: syncStateADT.synced(changesADT.unknown()),
});

// A value that is not a multiple of the rotation duration (to see how the animation is interrupted)
const DELAY = 1250;

export const openProject: (id: ProjectId) => taskEither.TaskEither<string, void> = () =>
  task.delay(DELAY)(taskEither.fromIO(constVoid));

export const syncProject: (id: ProjectId) => taskEither.TaskEither<SyncException, void> = () =>
  task.delay(DELAY)(taskEither.fromIO(constVoid));

export const removeProject: (id: ProjectId) => task.Task<void> = () =>
  task.delay(DELAY)(task.of(undefined));
