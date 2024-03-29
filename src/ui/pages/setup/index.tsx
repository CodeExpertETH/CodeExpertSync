import { Steps, Typography } from 'antd';
import React from 'react';
import { SetupState, setupState } from '@/domain/Setup';
import { VStack } from '@/ui/foundation/Layout';
import { LoginStep } from '@/ui/pages/setup/LoginStep';
import { RootDirStep } from '@/ui/pages/setup/RootDirStep';
import { SyncStep } from '@/ui/pages/setup/SyncStep';

export function Setup({ state }: { state: SetupState }) {
  const step = setupState.fold(state, {
    notAuthorized: () => 0,
    noRootDir: () => 1,
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
          noRootDir: () => 'Project directory',
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
            description: step === 0 ? <LoginStep /> : null,
          },
          {
            title: 'Project directory',
            description: step === 1 ? <RootDirStep /> : null,
          },
          {
            title: 'Synchronise tasks',
            description: step === 2 ? <SyncStep /> : null,
          },
        ]}
      />
    </VStack>
  );
}
