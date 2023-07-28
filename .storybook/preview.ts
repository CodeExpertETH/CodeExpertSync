import { Preview } from '@storybook/react';
import React from 'react';
import { RelativeProjectPath } from '../src/domain/FileSystem';
import { ProjectId, projectADT } from '../src/domain/Project';
import { changesADT, syncStateADT } from '../src/domain/SyncState';
import { mkProjectRepositoryTesting } from '../src/infrastructure/testing/ProjectRepository';
import { GlobalContextProvider } from '../src/ui/GlobalContext';
import { TimeContextProvider } from '../src/ui/contexts/TimeContext';
import { RouteContextProvider } from '../src/ui/routes';

const projectRepository = await mkProjectRepositoryTesting([
  projectADT.local({
    projectId: 'p1' as ProjectId,
    exerciseName: 'Exercise One',
    projectName: 'Project One',
    taskName: 'Task One',
    courseName: 'Course One',
    taskOrder: 1,
    exerciseOrder: 1,
    semester: 'AS22',
    basePath: '/tmp/cxsync-test' as RelativeProjectPath,
    files: [],
    syncedAt: new Date(),
    syncState: syncStateADT.synced(changesADT.unknown()),
  }),
]);

const testTimeContext = {
  now: () => new Date('2023-05-06T11:00:00Z'),
};
const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) =>
      React.createElement(GlobalContextProvider, { projectRepository }, React.createElement(Story)),
    (Story) => React.createElement(RouteContextProvider, {}, React.createElement(Story)),
    (Story) =>
      React.createElement(
        TimeContextProvider,
        { value: testTimeContext },
        React.createElement(Story),
      ),
  ],
};

export default preview;
