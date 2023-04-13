import {
  iots,
  nonEmptyArray,
  option,
  pipe,
  remoteData,
  task,
  taskEither,
} from '@code-expert/prelude';
import { Breadcrumb, Button, List, Result } from 'antd';
import { api } from 'api';
import React from 'react';

import { ClientId } from '../../domain/ClientId';
import { ProjectMetadata } from '../../domain/Project';
import { createSignedAPIRequest, createTokenWithClientId } from '../../domain/createAPIRequest';
import { Exception } from '../../domain/exception';
import { ActionMenu } from '../components/ActionMenu';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { Icon } from '../foundation/Icons';
import { Box, HStack } from '../foundation/Layout';
import { useRaceState } from '../hooks/useRaceState';

const Comp = (props: { projects: ProjectMetadata[]; updateProjects: () => void }) =>
  pipe(
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
                        label: 'TODO 1',
                        key: 'todo1',
                        icon: <Icon name="copy" />,
                      },
                      {
                        label: 'TODO 2',
                        key: 'todo2',
                        icon: <Icon name="sync" />,
                      },
                    ],
                  }}
                />
              }
            >
              <List.Item.Meta
                title={<a href="https://ant.design">{project.projectName}</a>}
                description={
                  <Breadcrumb
                    items={[
                      {
                        title: project.semester,
                      },
                      {
                        title: project.courseName,
                      },
                      {
                        title: project.exerciseName,
                      },
                    ]}
                  />
                }
              />
            </List.Item>
          )}
        />
      ),
    ),
  );

const useProjects = () => {
  const [state, mkSetState] = useRaceState<remoteData.RemoteData<Exception, ProjectMetadata[]>>(
    remoteData.initial,
  );

  React.useEffect(() => {
    const setState = mkSetState();
    void pipe(
      api.settingRead('projects', iots.array(ProjectMetadata)),
      task.map(option.getOrElse(() => [] as ProjectMetadata[])),
      task.map(remoteData.success),
      task.map(setState),
      task.run,
    );
  }, [mkSetState]);

  const updateProjects = React.useCallback(() => {
    const setState = mkSetState();
    void pipe(
      createSignedAPIRequest({
        path: 'project/metadata',
        method: 'GET',
        payload: {},
        codec: iots.array(ProjectMetadata),
      }),
      task.map((e) => {
        console.log(e);
        return e;
      }),
      taskEither.chainFirstTaskK((projects) => api.settingWrite('projects', projects)),
      taskEither.map(remoteData.success),
      taskEither.map(setState),
      task.run,
    );
  }, [mkSetState]);

  return [state, updateProjects] as const;
};

export const useProjectEvent = (onProjectAdded: () => void, clientId: ClientId): void => {
  const sse = React.useRef<EventSource | null>(null);

  React.useEffect(() => {
    const onProjectAdd = () => {
      onProjectAdded();
    };
    const onError = (e: Event) => {
      throw e;
    };

    if (sse.current == null) {
      void pipe(
        createTokenWithClientId({})(clientId),
        taskEither.map((token) => {
          //ensure that due to async nature only added once
          if (sse.current == null) {
            sse.current = new EventSource(`${api.APIUrl}/app/projectAccess?token=${token}`);
            sse.current.addEventListener('projectAccess', onProjectAdd);
            sse.current.addEventListener('error', onError);
          }
        }),
        task.run,
      );
    }

    return () => {
      sse.current?.removeEventListener('projectAccess', onProjectAdd);
      sse.current?.removeEventListener('error', onError);
      sse.current?.close();
      sse.current = null;
    };
  }, [onProjectAdded, clientId]);
};

export function Projects(props: { clientId: ClientId }) {
  const [projectsRD, updateProjects] = useProjects();
  useProjectEvent(() => {
    console.log('project added');
    updateProjects();
  }, props.clientId);

  return (
    <GuardRemoteData
      value={projectsRD}
      render={(projects) => <Comp projects={projects} updateProjects={updateProjects} />}
    />
  );
}
