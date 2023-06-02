import { useProperty } from '@frp-ts/react';
import { Alert, Typography } from 'antd';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { config } from '@/config';
import { ClientId } from '@/domain/ClientId';
import { getSetupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import { useProjectEventUpdate } from '@/ui/pages/projects/hooks/useProjectEventUpdate';

export const SyncStep = ({ clientId, active }: { clientId: ClientId; active: boolean }) => {
  const [{ projectRepository }, dispatch] = useGlobalContextWithActions();
  const projects = useProperty(projectRepository.projects);

  useProjectEventUpdate(projectRepository.fetchChanges, clientId);

  React.useEffect(() => {
    void pipe(
      getSetupState(projectRepository),
      task.map((state) => {
        dispatch({ setupState: state });
      }),
      task.run,
    );
  }, [projects, dispatch]);

  return active ? (
    <>
      <Typography.Paragraph>
        Visit the{' '}
        <a target="_blank" rel="noreferrer" href={config.CX_WEB_URL}>
          Code Expert website <Icon name="external-link-alt" />
        </a>
        …
      </Typography.Paragraph>
      <img style={{ width: '100%' }} src="/url.png" alt="Url hint" />

      <Typography.Paragraph>…and select a code task to sync.</Typography.Paragraph>
      <img style={{ width: '100%' }} src="/syncTask.png" alt="Sync Task hint" />

      <Typography.Paragraph>Then return here to view the task.</Typography.Paragraph>

      <Alert
        type="info"
        message={
          <>
            If you can’t find the “Sync” button in Code Expert your lecturer might have disabled
            syncing. Ask them for access. For more assistance,{' '}
            <a target="_blank" rel="noreferrer" href="https://docs.expert.ethz.ch">
              visit the documentation.
            </a>
          </>
        }
      />
    </>
  ) : null;
};
