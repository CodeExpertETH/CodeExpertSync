import { Steps, Typography } from 'antd';
import { api } from 'api';
import React from 'react';
import { option, pipe, task } from '@code-expert/prelude';
import { ClientId } from '@/domain/ClientId';
import { SetupState, setupState } from '@/domain/Setup';
import { EntityNotFoundException } from '@/domain/exception';
import { GuardRemoteData } from '@/ui/components/GuardRemoteData';
import { useAsync } from '@/ui/hooks/useAsync';
import { LoginStep } from '@/ui/pages/setup/LoginStep';
import { ProjectDirStep } from '@/ui/pages/setup/ProjectDirStep';
import { SyncStep } from '@/ui/pages/setup/SyncStep';

export function Setup(props: { state: SetupState }) {
  const clientId = useAsync(
    () =>
      pipe(
        api.settingRead('clientId', ClientId),
        task.map(
          option.getOrThrow(
            () =>
              new EntityNotFoundException(
                {},
                'No client id was found. Please contact the developers.',
              ),
          ),
        ),
        task.run,
      ),
    [],
  );

  console.log(props);

  const step = setupState.fold(props.state, {
    notAuthorized: () => 0,
    noProjectDir: () => 1,
    noProjectSync: () => 2,
  });

  return (
    <GuardRemoteData
      value={clientId}
      render={(clientId) => (
        <>
          <Typography.Title level={5} type="secondary" style={{ marginTop: '1rem' }}>
            Setup
          </Typography.Title>
          <Typography.Title level={1} style={{ marginTop: 0 }}>
            {setupState.fold(props.state, {
              notAuthorized: () => 'Log in',
              noProjectDir: () => 'Project directory',
              noProjectSync: () => 'Synchronise tasks',
            })}
          </Typography.Title>
          <Typography.Paragraph>
            Code Expert Sync lets you download copies of tasks to your computer. You can edit these
            with your favourite program and then send them back to the online IDE for submission.
          </Typography.Paragraph>
          <Steps
            direction="vertical"
            current={step}
            items={[
              {
                title: 'Log in',
                description: <LoginStep clientId={clientId} active={step === 0} />,
              },
              {
                title: 'Project directory',
                description: <ProjectDirStep active={step === 1} />,
              },
              {
                title: 'Synchronise tasks',
                description: <SyncStep clientId={clientId} active={step === 2} />,
              },
            ]}
          />
        </>
      )}
    />
  );
}
