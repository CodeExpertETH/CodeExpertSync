// ui/hooks/useRemoteData.stories.tsx
import { adt, pipe, remoteData, task } from '@code-expert/prelude';
import { Story } from '@storybook/react';
import React from 'react';

import { UncaughtException } from '../../domain/exception';
import { useCachedRemoteData, useRemoteData } from './useRemoteData';

const foldMeteorCallType = adt.foldFromKeys({ resolve: null, reject: null, throw: null });
type MeteorCallType = adt.TypeOfKeys<typeof foldMeteorCallType>;

function mockMethodCall(type: MeteorCallType): task.Task<string> {
  return () =>
    new Promise((resolve, reject) => {
      foldMeteorCallType(type, {
        resolve: () => {
          setTimeout(() => resolve(`resolve ${Math.random()}`), 1000);
        },
        reject: () => {
          setTimeout(() => reject(new UncaughtException(`reject ${Math.random()}`)), 1000);
        },
        throw: () => {
          throw new UncaughtException(`throw ${Math.random()}`);
        },
      });
    });
}

// -----------------------------------------------------------------------------

interface UseRemoteDataTestProps {
  type: MeteorCallType;
  useRemoteDataHook: typeof useRemoteData;
}

function UseRemoteDataTest({ type, useRemoteDataHook }: UseRemoteDataTestProps) {
  const [rd, refresh] = useRemoteDataHook(mockMethodCall);
  return (
    <div>
      {pipe(
        rd,
        remoteData.fold(
          () => <div>[Initial]</div>,
          () => <div>[Loading]</div>,
          (e) => <div>[Error] {e.message}</div>,
          (x) => <div>[Success] {x}</div>,
        ),
      )}
      <button type="button" onClick={() => refresh(type)}>
        {remoteData.isInitial(rd) || remoteData.isPending(rd) ? 'Fetch' : 'Refresh'}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------

export default {
  title: 'hooks/useRemoteData',
  component: UseRemoteDataTest,
};

const Template: Story<{ type: MeteorCallType; mode: 'fresh' | 'stale' }> = ({
  mode = 'fresh',
  type = 'resolve',
}) => (
  <UseRemoteDataTest
    type={type}
    useRemoteDataHook={mode === 'fresh' ? useRemoteData : useCachedRemoteData}
  />
);

export const Resolve = Template.bind({});
Resolve.args = {};

export const Reject = Template.bind({});
Reject.args = {
  type: 'reject',
};

export const Throw = Template.bind({});
Throw.args = {
  type: 'throw',
};

export const CachedResolve = Template.bind({});
CachedResolve.args = {
  mode: 'stale',
};

export const CachedReject = Template.bind({});
CachedReject.args = {
  mode: 'stale',
  type: 'reject',
};

export const CachedThrow = Template.bind({});
CachedThrow.args = {
  mode: 'stale',
  type: 'throw',
};
