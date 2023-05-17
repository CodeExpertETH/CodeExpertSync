import React from 'react';
import { tagged } from '@code-expert/prelude';

export type GlobalSetupState = tagged.Tagged<'notSetup'> | tagged.Tagged<'setup'>;

export const globalSetupState = tagged.build<GlobalSetupState>();

export type SetupState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'noProjectDir'>
  | tagged.Tagged<'noProjectSync'>;
export const setupState = tagged.build<SetupState>();

export const useSetupState = () => {
  const [state, setState] = React.useState<SetupState>(() => setupState.notAuthorized());

  React.useEffect(() => {
    //TODO update the state
  }, []);

  return [state, setState] as const;
};
