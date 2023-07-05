import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { Typography } from 'antd';
import { api } from 'api';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { getSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { EditableCard } from '@/ui/components/EditableCard';

export const ProjectDirStep = ({ active }: { active: boolean }) => {
  const [{ projectRepository }, dispatch] = useGlobalContextWithActions();

  const selectDir = async () => {
    const projectDir = await open({
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    if (projectDir != null) {
      await pipe(
        api.settingWrite('projectDir', projectDir),
        task.chain(() => getSetupState(projectRepository)),
        task.map((state) => dispatch({ setupState: state })),
        task.run,
      );
    }
  };

  return active ? (
    <>
      <Typography.Paragraph>
        Before you start, please choose where on your computer you would like to store the synced
        projects.
      </Typography.Paragraph>
      <Typography.Paragraph>This can later be changed in settings.</Typography.Paragraph>
      {active && (
        <EditableCard
          iconName="folder-open-regular"
          description="All projects are synced into this directory"
          value={''}
          actions={[{ name: 'Select…', iconName: 'edit', type: 'link', onClick: selectDir }]}
        />
      )}
    </>
  ) : null;
};
