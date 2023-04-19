import { iots, task } from '@code-expert/prelude';
import { open } from '@tauri-apps/api/dialog';
import { homeDir } from '@tauri-apps/api/path';
import { Button, Form, Input, Space, message } from 'antd';
import { api } from 'api';
import React from 'react';

import { routes, useGlobalContextWithActions } from '../GlobalContext';
import { GuardRemoteData } from '../components/GuardRemoteData';
import { Icon } from '../foundation/Icons';
import { useSettingsFallback } from '../hooks/useSettings';

function SettingsInner({ projectDir }: { projectDir: string }) {
  const [, dispatch] = useGlobalContextWithActions();
  const [form] = Form.useForm();

  const selectDir = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await homeDir(),
    });
    if (selected != null) {
      form.setFieldsValue({ projectDir: selected });
    }
  };

  const onFinish = async (data: { projectDir: string }) => {
    await api.settingWrite('projectDir', data.projectDir)();
    void message.success('Saved the settings');
    dispatch({ currentPage: routes.main() });
  };

  return (
    <div>
      <h1>Settings</h1>
      <Form requiredMark={false} onFinish={onFinish} form={form} initialValues={{ projectDir }}>
        <Form.Item label="Project directory" extra="Please select a root folder for your projects.">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="projectDir"
              noStyle
              rules={[
                {
                  required: true,
                  message: 'You need to select a directory to save the projects to.',
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
            <Button onClick={selectDir} title="Select directory">
              <Icon name="folder-open-regular" />
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item>
          <Space>
            <Form.Item shouldUpdate>
              {() => (
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={
                    !form.isFieldsTouched(true) ||
                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                  }
                >
                  Save
                </Button>
              )}
            </Form.Item>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export function Settings() {
  const projectDir = useSettingsFallback('projectDir', iots.string, task.of(''), []);

  return (
    <GuardRemoteData
      value={projectDir}
      render={(projectDir) => <SettingsInner projectDir={projectDir} />}
    />
  );
}
