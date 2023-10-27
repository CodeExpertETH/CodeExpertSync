import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { Typography } from 'antd';
import { api } from 'api';
import React from 'react';
import { constVoid, option, pipe, task, taskOption } from '@code-expert/prelude';
import { getSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { EditableCard } from '@/ui/components/EditableCard';

const selectRootDir: task.Task<string | Array<string> | null> = async () =>
  open({
    directory: true,
    multiple: false,
    defaultPath: await homeDir(),
  });

export const RootDirStep = () => {
  const [{ projectRepository }, dispatch] = useGlobalContextWithActions();

  const selectDir: task.Task<void> = pipe(
    selectRootDir,
    task.map(option.fromPredicate((rootDir) => typeof rootDir === 'string')),
    taskOption.chainTaskK((rootDir) =>
      pipe(
        api.settingWrite('rootDir', rootDir),
        task.chain(() => getSetupState(projectRepository)),
      ),
    ),
    task.chainIOK(
      option.fold(
        () => constVoid,
        (state) => () => dispatch({ setupState: state }),
      ),
    ),
  );

  return (
    <>
      <Typography.Paragraph>
        Before you start, please choose where on your computer you would like to store the synced
        projects.
      </Typography.Paragraph>
      <Typography.Paragraph>This can later be changed in settings.</Typography.Paragraph>
      <EditableCard
        iconName="folder-open-regular"
        description="All projects are synced into this directory"
        value={''}
        actions={[{ name: 'Select…', iconName: 'edit', type: 'link', onClick: selectDir }]}
      />
    </>
  );
};
