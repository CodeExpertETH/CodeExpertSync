import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { Form, message } from 'antd';
import { api } from 'api';
import React from 'react';
import { iots, remoteData, task } from '@code-expert/prelude';
import { UserInfo } from '@/domain/UserInfo';
import { routes, useGlobalContextWithActions } from '@/ui/GlobalContext';
import { EditableCard } from '@/ui/components/EditableCard';
import { GuardRemoteData } from '@/ui/components/GuardRemoteData';
import { useSettingsFallback } from '@/ui/hooks/useSettings';
import { useUserInfo } from '@/ui/pages/settings/hooks/useUserInfo';

// TODO get handler
function SettingsInner({ projectDir, userInfo }: { projectDir: string; userInfo: UserInfo }) {
  const [, dispatch] = useGlobalContextWithActions();
  const [form] = Form.useForm();

  const selectDir = async () => {
    const projectDir = await open({
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    if (projectDir != null) {
      form.setFieldsValue({ projectDir });
      await api.settingWrite('projectDir', projectDir)();
      void message.success('Saved the settings');
    }
  };

  const logout = () => {
    dispatch({ currentPage: routes.logout() });
  };

  const deleteDir = () => message.warning('Not implemented yet');
  const setHandler = () => message.warning('Not implemented yet');
  const resetHandler = () => message.warning('Not implemented yet');

  return (
    <div style={{ marginTop: '1rem' }}>
      <h1>Settings</h1>
      <Form
        requiredMark={false}
        form={form}
        initialValues={{ projectDir, userName: userInfo.userName }}
      >
        <Form.Item dependencies={['userName']}>
          {({ getFieldValue }) => (
            <EditableCard
              iconName="user"
              title="Profile"
              description="Signed in as"
              value={getFieldValue('userName')}
              actions={[
                {
                  name: 'Logout…',
                  iconName: 'sign-out-alt',
                  danger: true,
                  type: 'link',
                  onClick: logout,
                },
              ]}
            />
          )}
        </Form.Item>
        <Form.Item dependencies={['projectDir']}>
          {({ getFieldValue }) => (
            <EditableCard
              iconName="folder-open-regular"
              title="Project directory"
              description="All projects are synced into this directory"
              value={getFieldValue('projectDir')}
              actions={[
                { name: 'Change…', iconName: 'edit', type: 'link', onClick: selectDir },
                {
                  name: 'Delete…',
                  iconName: 'trash',
                  danger: true,
                  type: 'link',
                  onClick: deleteDir,
                },
              ]}
            />
          )}
        </Form.Item>
        <Form.Item dependencies={['handler']}>
          {({ getFieldValue }) => (
            <EditableCard
              iconName="external-link-alt"
              title="Handler application"
              description="Projects are opened with this application"
              value={getFieldValue('handler')}
              actions={[
                { name: 'Change…', iconName: 'edit', type: 'link', onClick: setHandler },
                {
                  name: 'Reset…',
                  iconName: 'trash',
                  danger: true,
                  type: 'link',
                  onClick: resetHandler,
                },
              ]}
            />
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export function Settings() {
  const projectDirRD = useSettingsFallback('projectDir', iots.string, task.of(''), []);
  const userInfoRD = useUserInfo();

  return (
    <GuardRemoteData
      value={remoteData.sequenceS({
        projectDir: projectDirRD,
        userInfo: userInfoRD,
      })}
      render={({ projectDir, userInfo }) => (
        <SettingsInner userInfo={userInfo} projectDir={projectDir} />
      )}
    />
  );
}
