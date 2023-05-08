import { nonEmptyArray, option, pipe, task, taskEither } from '@code-expert/prelude';
import { Button, List, Result } from 'antd';
import React from 'react';

import { ProjectId, ProjectMetadata } from '../../../domain/Project';
import { ActionMenu } from '../../components/ActionMenu';
import { Icon } from '../../foundation/Icons';
import { Box, HStack } from '../../foundation/Layout';
import { notificationT } from '../../helper/notifications';
import { useProjectRemove } from './hooks/useProjectRemove';
import { useProjectSync } from './hooks/useProjectSync';

export const ProjectList = (props: { projects: ProjectMetadata[]; updateProjects: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [removeProject] = useProjectRemove(() => {
    props.updateProjects();
  });
  const syncProjectM = useProjectSync();

  const syncProject = (projectId: ProjectId, projectName: string) => {
    void pipe(
      task.fromIO(() => setLoading(true)),
      task.chain(() => syncProjectM(projectId, projectName)),
      taskEither.fold(
        (e) => notificationT.error(e),
        () => notificationT.success(`The project ${projectName} was synced successfully.`),
      ),
      task.chainIOK(() => () => setLoading(false)),
      task.run,
    );
  };

  return pipe(
    props.projects,
    nonEmptyArray.fromArray,
    option.fold(
      () => (
        <Result
          title="No local projects found"
          extra={
            <Button type="primary" onClick={props.updateProjects} icon={<Icon name="sync" />}>
              Sync with code expert
            </Button>
          }
        />
      ),
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
                        label: 'Sync to local computer',
                        key: 'sync',
                        icon: <Icon name="sync" />,
                        onClick: () => {
                          void syncProject(project.projectId, project.projectName);
                        },
                      },
                      { type: 'divider' },
                      {
                        label: 'Remove',
                        key: 'remove',
                        icon: <Icon name="trash" />,
                        onClick: () => {
                          removeProject(project.projectId, project.projectName);
                        },
                      },
                    ],
                  }}
                />
              }
            >
              <List.Item.Meta
                title={project.projectName}
                description={`${project.semester}/${project.courseName}/${project.exerciseName}`}
              />
            </List.Item>
          )}
        />
      ),
    ),
  );
};
