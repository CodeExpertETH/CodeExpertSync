import { useProperty } from '@frp-ts/react';
import React from 'react';
import {
  array,
  boolean,
  constVoid,
  nonEmptyArray,
  option,
  pipe,
  task,
  taskEither,
} from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { fileSystemStack } from '@/domain/FileSystem/fileSystemStack';
import { getProjectDir, ordProjectExercise } from '@/domain/Project';
import { apiStack } from '@/domain/ProjectSync/apiStack';
import { downloadFile } from '@/domain/ProjectSync/downloadFile';
import { globalSetupState, setupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { CourseHeader } from '@/ui/components/CourseHeader';
import { VStack } from '@/ui/foundation/Layout';
import { notificationIO } from '@/ui/helper/notifications';
import { PageLayout } from '@/ui/layout/PageLayout';
import { CourseItem, courseItemEq, fromProject } from '@/ui/pages/courses/components/model';
import { ProjectList } from '@/ui/pages/projects/components/ProjectList';
import { projectsByExercise } from '@/ui/pages/projects/components/ProjectList/model/Exercise';
import { useProjectOpen } from '@/ui/pages/projects/hooks/useProjectOpen';
import { useProjectSync } from '@/ui/pages/projects/hooks/useProjectSync';
import { routes, useRoute } from '@/ui/routes';
import { panic } from '@/utils/error';

const stack = { ...fileSystemStack, ...apiStack };

export function Projects({ course, clientId }: { course: CourseItem; clientId: ClientId }) {
  const [{ projectRepository, connectionStatus }, dispatch] = useGlobalContextWithActions();
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

  return (
    <PageLayout>
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
              onOpen={openProject}
              onSync={(project, force) =>
                pipe(
                  // todo disable buttons instead?
                  connectionStatus === 'online',
                  boolean.fold(
                    () => {
                      notificationIO.warning('No internet connection', 5)();
                      return taskEither.right(undefined);
                    },
                    () => pipe(syncProject(project, { force }), taskEither.map(constVoid)),
                  ),
                )
              }
              onRemove={(project) =>
                pipe(
                  // todo disable buttons instead?
                  connectionStatus === 'online',
                  boolean.fold(
                    () => {
                      notificationIO.warning('No internet connection', 5)();
                      return task.of(undefined);
                    },
                    () => projectRepository.removeProject(project),
                  ),
                )
              }
              onRevertFile={(projectId, file) =>
                pipe(
                  projectRepository.getProject(projectId),
                  taskEither.fromOption(() =>
                    panic('Could not revert file in non-existent project'),
                  ),
                  taskEither.chainTaskK(getProjectDir),
                  taskEither.chain((projectDir) =>
                    downloadFile(stack)({ projectId, file, projectDir }),
                  ),
                )
              }
            />
          )),
        ),
        option.fold(
          () => {
            dispatch({
              setupState: globalSetupState.setup({ state: setupState.noProjectSync({ clientId }) }),
            });
            return null;
          },
          (xs) => <VStack gap="lg">{xs}</VStack>,
        ),
      )}
    </PageLayout>
  );
}
