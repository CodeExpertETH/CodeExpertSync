import { Steps, Typography } from 'antd';
import React from 'react';
import { ClientId } from '@/domain/ClientId';
import { SetupState, setupState } from '@/domain/Setup';
import { VStack } from '@/ui/foundation/Layout';
import { LoginStep } from '@/ui/pages/setup/LoginStep';
import { ProjectDirStep } from '@/ui/pages/setup/ProjectDirStep';
import { SyncStep } from '@/ui/pages/setup/SyncStep';

export function Setup({ state, clientId }: { state: SetupState; clientId: ClientId }) {
  const step = setupState.fold(state, {
    notAuthorized: () => 0,
    noProjectDir: () => 1,
    noProjectSync: () => 2,
  });

  return (
    <VStack mh>
      <Typography.Title level={5} type="secondary" style={{ marginTop: '1rem' }}>
        Setup
      </Typography.Title>
      <Typography.Title level={1} style={{ marginTop: 0 }}>
        {setupState.fold(state, {
          notAuthorized: () => 'Log in',
          noProjectDir: () => 'Project directory',
          noProjectSync: () => 'Synchronise tasks',
        })}
      </Typography.Title>
      <Typography.Paragraph>
        Code Expert Sync lets you download copies of tasks to your computer. You can edit these with
        your favourite program and then send them back to the online IDE for submission.
      </Typography.Paragraph>
      <Steps
        direction="vertical"
        current={step}
        items={[
          {
            title: 'Log in',
            description: step === 0 ? <LoginStep clientId={clientId} /> : null,
          },
          {
            title: 'Project directory',
            description: step === 1 ? <ProjectDirStep /> : null,
          },
          {
            title: 'Synchronise tasks',
            description: step === 2 ? <SyncStep clientId={clientId} /> : null,
          },
        ]}
      />
    </VStack>
  );
}
