import { useProperty } from '@frp-ts/react';
import { Alert, Typography } from 'antd';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { config } from '@/config';
import { getSetupState, globalSetupState, setupState } from '@/domain/Setup';
import { useGlobalContextWithActions } from '@/ui/GlobalContext';
import { Icon } from '@/ui/foundation/Icons';
import ProjectEventStatus from '@/ui/pages/projects/components/ProjectEventStatus';
import { useProjectEventUpdate } from '@/ui/pages/projects/hooks/useProjectEventUpdate';
import { invariant } from '@/utils/error';

export const SyncStep = () => {
  const [{ projectRepository, apiConnectionAtom, setupState: state }, dispatch] =
    useGlobalContextWithActions();
  const projects = useProperty(projectRepository.projects);

  invariant(
    globalSetupState.is.setup(state) && setupState.is.noProjectSync(state.value.state),
    'GlobalSetupState must be Setup(NoProjectSync) when rendering SyncStep',
  );
  const clientId = state.value.state.value.clientId;

  const sseStatus = useProjectEventUpdate(
    projectRepository.fetchChanges,
    clientId,
    apiConnectionAtom,
  );

  React.useEffect(() => {
    pipe(
      getSetupState(projectRepository),
      task.map((state) => {
        dispatch({ setupState: state });
      }),
      task.run,
    );
  }, [projectRepository, projects, dispatch]);

  return (
    <>
      <ProjectEventStatus status={sseStatus} />
      <Typography.Paragraph>
        Visit the{' '}
        <a target="_blank" rel="noreferrer" href={config.CX_WEB_URL}>
          Code Expert website <Icon name="external-link-alt" />
        </a>
        {' …'}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <img style={{ width: '100%' }} src="/url.png" alt="Url hint" />
      </Typography.Paragraph>

      <Typography.Paragraph>… and select a code task to sync.</Typography.Paragraph>
      <Typography.Paragraph>
        <img style={{ width: '100%' }} src="/syncTask.png" alt="Sync Task hint" />
      </Typography.Paragraph>

      <Typography.Paragraph>Then return here to view the task.</Typography.Paragraph>

      <Alert
        type="info"
        message={
          <>
            If you can’t find the “Sync to computer” button in Code Expert, your lecturer may have
            disabled syncing. Ask them for access. For more assistance,{' '}
            <a target="_blank" rel="noreferrer" href="https://docs.expert.ethz.ch">
              visit the documentation.
            </a>
          </>
        }
      />
    </>
  );
};
