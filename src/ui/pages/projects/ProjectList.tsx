import { Button, List } from 'antd';
import React from 'react';
import { nonEmptyArray, option, pipe, task, taskEither } from '@code-expert/prelude';
import { Project, projectADT } from '@/domain/Project';
import { getSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { ActionMenu } from '@/ui/components/ActionMenu';
import { Icon } from '@/ui/foundation/Icons';
import { Box, HStack } from '@/ui/foundation/Layout';
import { notificationT } from '@/ui/helper/notifications';
import { useProjectVerify } from '@/ui/pages/projects/hooks/useProjectVerify';
import { useProjectOpen } from './hooks/useProjectOpen';
import { useProjectRemove } from './hooks/useProjectRemove';
import { useProjectSync } from './hooks/useProjectSync';

export const ProjectList = (props: { projects: Array<Project>; updateProjects: () => void }) => {
  const [, dispatch] = useGlobalContextWithActions();

  const updateState = () => {
    void pipe(
      getSetupState(),
      task.map((state) => {
        dispatch({ setupState: state });
      }),
      task.run,
    );
  };

  const [loading, setLoading] = React.useState(false);
  const removeProject = useProjectRemove(() => {
    props.updateProjects();
  });
  const openProject = useProjectOpen();
  const syncProjectM = useProjectSync();
  const verifyProjectM = useProjectVerify();

  const syncProject = (project: Project) => {
    void pipe(
      task.fromIO(() => setLoading(true)),
      task.chain(() => syncProjectM(project)),
      taskEither.fold(
        (e) => notificationT.error(e),
        () =>
          notificationT.success(
            `The project ${project.value.projectName} was synced successfully.`,
          ),
      ),
      task.chainIOK(() => () => setLoading(false)),
      task.run,
    );
  };

  const verifyProject = (project: Project) => {
    void pipe(
      task.fromIO(() => setLoading(true)),
      task.chain(() => verifyProjectM(project.value)),
      taskEither.fold(
        (e) => notificationT.error(e),
        () =>
          notificationT.success(
            `The project ${project.value.projectName} was successfully verified.`,
          ),
      ),
      task.chainIOK(() => () => setLoading(false)),
      task.run,
    );
  };

  return pipe(
    props.projects,
    nonEmptyArray.fromArray,
    option.fold(
      () => {
        updateState();
        return null;
      },
      (projects) => (
        <List
          header={
            <HStack justify={'space-between'} pt>
              <Box>Projects</Box>
              <Box>
                <Button
                  title="Sync Projects"
                  shape="circle"
                  icon={<Icon name="sync" />}
                  onClick={props.updateProjects}
                />
              </Box>
            </HStack>
          }
          loading={loading}
          itemLayout="horizontal"
          dataSource={projects}
          renderItem={(project) => (
            <List.Item
              extra={
                <ActionMenu
                  label={'Actions'}
                  menu={{
                    items: [
                      {
                        label: 'Open directory',
                        key: 'open',
                        disabled: projectADT.is.remote(project),
                        icon: <Icon name="folder-open-regular" />,
                        onClick: openProject(project.value.projectId),
                      },
                      {
                        label: 'Sync to local computer',
                        key: 'sync',
                        icon: <Icon name="sync" />,
                        onClick: () => {
                          void syncProject(project);
                        },
                      },
                      {
                        label: 'Verify project',
                        key: 'verify',
                        icon: <Icon name="check" />,
                        onClick: () => {
                          void verifyProject(project);
                        },
                      },
                      { type: 'divider' },
                      {
                        label: 'Remove',
                        key: 'remove',
                        icon: <Icon name="trash" />,
                        onClick: () => {
                          removeProject(project.value.projectId, project.value.projectName);
                        },
                      },
                    ],
                  }}
                />
              }
            >
              <List.Item.Meta
                title={project.value.projectName}
                description={`${project.value.semester}/${project.value.courseName}/${project.value.exerciseName}`}
              />
            </List.Item>
          )}
        />
      ),
    ),
  );
};
