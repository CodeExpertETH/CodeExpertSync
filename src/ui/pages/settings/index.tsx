import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { Form, message } from 'antd';
import { api } from 'api';
import React from 'react';
import { iots, remote } from '@code-expert/prelude';
import { UserInfo } from '@/domain/UserInfo';
import { EditableCard } from '@/ui/components/EditableCard';
import { GuardRemote } from '@/ui/components/GuardRemoteData';
import { styled } from '@/ui/foundation/Theme';
import { useSettingsFallback } from '@/ui/hooks/useSettings';
import Version from '@/ui/pages/settings/Version';
import { useUserInfo } from '@/ui/pages/settings/hooks/useUserInfo';
import { routes, useRoute } from '@/ui/routes';

const Container = styled('div', () => ({
  marginTop: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: 'calc(100% - 18px)',
}));

const SettingsDiv = styled('div', ({ tokens }) => ({
  padding: tokens.padding,
}));

function SettingsInner({ rootDir, userInfo }: { rootDir: string; userInfo: UserInfo }) {
  const { navigateTo } = useRoute();
  const [form] = Form.useForm();

  const selectDir = async () => {
    const rootDir = await open({
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    if (rootDir != null) {
      form.setFieldsValue({ rootDir });
      await api.settingWrite('rootDir', rootDir)();
      void message.success('Saved the settings');
    }
  };

  const logout = () => {
    navigateTo(routes.logout());
  };

  //TODO think about if we want to implement this
  const deleteDir = () => message.warning('Not implemented yet');

  return (
    <Container>
      <SettingsDiv>
        <h1>Settings</h1>
        <Form
          requiredMark={false}
          form={form}
          initialValues={{ rootDir, userName: userInfo.userName }}
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
          <Form.Item dependencies={['rootDir']}>
            {({ getFieldValue }) => (
              <EditableCard
                iconName="folder-open-regular"
                title="Project directory"
                description="All projects are synced into this directory"
                value={getFieldValue('rootDir')}
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
        </Form>
      </SettingsDiv>
      <Version />
    </Container>
  );
}

export function Settings() {
  const rootDirRD = useSettingsFallback('rootDir', iots.string, '', []);
  const userInfoRD = useUserInfo();

  return (
    <GuardRemote
      value={remote.sequenceS({
        rootDir: rootDirRD,
        userInfo: userInfoRD,
      })}
      render={({ rootDir, userInfo }) => <SettingsInner userInfo={userInfo} rootDir={rootDir} />}
    />
  );
}
