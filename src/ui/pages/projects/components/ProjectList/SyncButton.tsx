import React from 'react';
import { io } from '@code-expert/prelude';
import { ActionButton } from '@/ui/components/ActionButton';
import { Icon } from '@/ui/foundation/Icons';
import { keyframes, styled, useTheme } from '@/ui/foundation/Theme';
import useTimeout from '@/ui/hooks/useTimeout';
import {
  SyncButtonState,
  syncButtonStateADT,
} from '@/ui/pages/projects/components/ProjectList/model/SyncButtonState';

const RotatingIcon = styled(Icon, () => ({
  animationName: keyframes({ to: { rotate: '360deg' } }),
  animationDuration: '1s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
}));

export interface SyncButtonProps {
  now: io.IO<Date>;
  state: SyncButtonState;
  onClick: io.IO<void>;
}

export const SyncButton = ({ now, state, onClick }: SyncButtonProps) =>
  syncButtonStateADT.fold(state, {
    remote: () => (
      <ActionButton
        label="Project available remotely, click to sync"
        icon="cloud-download-alt"
        onClick={onClick}
      />
    ),
    synced: (date) => <Synced now={now()} syncedAt={date} onClick={onClick} />,
    syncing: () => (
      <ActionButton
        label="Sync in progress …"
        icon={<RotatingIcon name={'sync'} />}
        onClick={onClick}
        style={{ cursor: 'wait' }}
        disabled
      />
    ),
    changesRemote: () => (
      <ActionButton
        label="Remote changes available, click to pull"
        icon="arrow-down"
        onClick={onClick}
      />
    ),
    changesLocal: () => (
      <ActionButton
        label="Local changes available, click to push"
        icon="arrow-up"
        onClick={onClick}
      />
    ),
    changesBoth: () => (
      <ActionButton
        label="Local and remote changes available, click to sync"
        icon={<Icon name="arrow-right-arrow-left" style={{ transform: 'rotate(-90deg)' }} />}
        onClick={onClick}
      />
    ),
    warning: (date) => <Errored now={now()} syncedAt={date} onClick={onClick} />,
  });

const SwapAfterDelay = ({
  now,
  syncedAt,
  initialEl,
  delayedEl,
}: {
  now: Date;
  syncedAt: Date;
  initialEl: React.ReactElement;
  delayedEl: React.ReactElement;
}) => {
  const RECENT_THRESHOLD_MS = 1000;
  const COMPLETION_DURATION_MS = 2000;
  const timeSinceSync = now.getTime() - syncedAt.getTime();
  const hasSyncedRecently = 0 <= timeSinceSync && timeSinceSync <= RECENT_THRESHOLD_MS;
  const [showInitial, setShowInitial] = React.useState(hasSyncedRecently);
  useTimeout(() => setShowInitial(false), COMPLETION_DURATION_MS);
  return showInitial ? initialEl : delayedEl;
};

const Synced = ({ now, syncedAt, onClick }: { now: Date; syncedAt: Date; onClick(): void }) => {
  const { tokens } = useTheme();
  return (
    <SwapAfterDelay
      now={now}
      syncedAt={syncedAt}
      initialEl={
        <ActionButton
          label="Synced moments ago"
          icon={<Icon name={'circle-check'} color={tokens.colorSuccess} />}
          style={{ cursor: 'wait' }}
          disabled
        />
      }
      delayedEl={
        <ActionButton
          label={`Last synced at ${syncedAt.toISOString()}`}
          icon="sync"
          onClick={onClick}
        />
      }
    />
  );
};

const Errored = ({ now, syncedAt, onClick }: { now: Date; syncedAt: Date; onClick(): void }) => {
  const { tokens } = useTheme();
  return (
    <SwapAfterDelay
      now={now}
      syncedAt={syncedAt}
      initialEl={
        <ActionButton
          label="An error occurred"
          icon={<Icon name={'exclamation-triangle'} color={tokens.colorWarning} />}
          style={{ cursor: 'wait' }}
          disabled
        />
      }
      delayedEl={
        <ActionButton
          label={`Last synced at ${syncedAt.toISOString()}`}
          icon="sync"
          onClick={onClick}
        />
      }
    />
  );
};
