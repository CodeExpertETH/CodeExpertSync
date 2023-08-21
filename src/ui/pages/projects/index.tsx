import { useProperty } from '@frp-ts/react';
import React from 'react';
import {
  array,
  boolean,
  constVoid,
  flow,
  nonEmptyArray,
  option,
  pipe,
  task,
  taskEither,
} from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { fileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { getProjectPath, ordProjectExercise } from '@/domain/Project';
import { apiStack } from '@/domain/ProjectSync/apiStack';
import { downloadFile } from '@/domain/ProjectSync/downloadFile';
import { globalSetupState, setupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { CourseHeader } from '@/ui/components/CourseHeader';
import { VStack } from '@/ui/foundation/Layout';
import { notificationIO } from '@/ui/helper/notifications';
import { PageLayout } from '@/ui/layout/PageLayout';
import { CourseItem, courseItemEq, fromProject } from '@/ui/pages/courses/components/model';
import ProjectEventStatus from '@/ui/pages/projects/components/ProjectEventStatus';
import { ProjectList } from '@/ui/pages/projects/components/ProjectList';
import { projectsByExercise } from '@/ui/pages/projects/components/ProjectList/model/Exercise';
import { useProjectOpen } from '@/ui/pages/projects/hooks/useProjectOpen';
import { useProjectSync } from '@/ui/pages/projects/hooks/useProjectSync';
import { routes, useRoute } from '@/ui/routes';
import { panic } from '@/utils/error';
import { useProjectEventUpdate } from './hooks/useProjectEventUpdate';

const stack = { ...fileSystemStack, ...apiStack };

export function Projects({ clientId, course }: { clientId: ClientId; course: CourseItem }) {
  const [{ projectRepository, online }, dispatch] = useGlobalContextWithActions();
  const projects = pipe(
    useProperty(projectRepository.projects),
    array.filter((project) => courseItemEq.equals(fromProject(project), course)),
  );
  const openProject = useProjectOpen();
  const syncProject = useProjectSync();
  const { navigateTo } = useRoute();

  const goOverview = () => {
    navigateTo(routes.courses());
  };

  const sseStatus = useProjectEventUpdate(projectRepository.fetchChanges, clientId);

  return (
    <PageLayout>
      <ProjectEventStatus status={sseStatus} />
      <CourseHeader semester={course.semester} title={course.name} goOverview={goOverview} />
      {pipe(
        projects,
        array.sort(ordProjectExercise),
        nonEmptyArray.fromArray,
        option.map(projectsByExercise),
        option.map(
          nonEmptyArray.map(({ name, projects }) => (
            <ProjectList
              key={name}
              exerciseName={name}
              projects={projects}
              onOpen={flow(
                openProject,
                taskEither.fromTaskOption(() => 'Could not open project'),
              )}
              onSync={(projectId, force) =>
                pipe(
                  online,
                  boolean.fold(
                    () => {
                      notificationIO.warning('No internet connection', 5)();
                      return taskEither.right(undefined);
                    },
                    () =>
                      pipe(
                        projectRepository.getProject(projectId),
                        taskEither.fromTaskOption(() => {
                          panic('Project to sync not found');
                        }),
                        taskEither.chainFirst((project) => syncProject(project, { force })),
                        taskEither.map(constVoid),
                      ),
                  ),
                )
              }
              onRemove={(projectId) =>
                pipe(
                  online,
                  boolean.fold(
                    () => {
                      notificationIO.warning('No internet connection', 5)();
                      return task.of(undefined);
                    },
                    () => projectRepository.removeProject(projectId),
                  ),
                )
              }
              onRevertFile={(projectId, file) =>
                pipe(
                  projectRepository.getProject(projectId),
                  taskEither.fromTaskOption(() =>
                    panic('Could not revert file in non-existent project'),
                  ),
                  taskEither.chain(getProjectPath(stack)),
                  taskEither.chain((projectDir) =>
                    downloadFile(stack)({
                      projectId,
                      file,
                      projectDir,
                    }),
                  ),
                )
              }
            />
          )),
        ),
        option.fold(
          () => {
            dispatch({ setupState: globalSetupState.setup({ state: setupState.noProjectSync() }) });
            return null;
          },
          (xs) => <VStack gap="lg">{xs}</VStack>,
        ),
      )}
    </PageLayout>
  );
}
