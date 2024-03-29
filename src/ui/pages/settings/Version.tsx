import { api } from 'api';
import React from 'react';
import { pipe, task } from '@code-expert/prelude';
import { config } from '@/config';
import { styled } from '@/ui/foundation/Theme';

const VersionDiv = styled('div', ({ tokens }) => ({
  borderTop: `1px solid ${tokens.colorBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: tokens.padding,
}));

const Version = () => {
  const [version, setVersion] = React.useState<string>('');

  React.useEffect(() => {
    pipe(api.getVersion, task.map(setVersion), task.run);
  }, []);

  return (
    <VersionDiv>
      <span>
        Version: {version} (Build:{' '}
        {config.GITHUB_SHA != null ? config.GITHUB_SHA.slice(0, 7) : 'dev'})
      </span>
    </VersionDiv>
  );
};

export default Version;
