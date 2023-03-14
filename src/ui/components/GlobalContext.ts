import { constVoid, option, pipe, tagged, task } from '@code-expert/prelude';
import { api } from 'api';
import equal from 'fast-deep-equal';
import React, { useEffect } from 'react';

import { AccessToken } from '../../domain/AuthToken';
import Loading from './Loading';

export type Routes =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'main'>
  | tagged.Tagged<'waitingForAuthorization'>;

export type AuthState =
  | tagged.Tagged<'notAuthorized'>
  | tagged.Tagged<'waitingForAuthorization', { code_verifier: string }>
  | tagged.Tagged<'authorized', { accessToken: AccessToken }>;
export const routes = tagged.build<Routes>();

export interface GlobalContext {
  readonly accessToken?: AccessToken;
  readonly currentPage: Routes;
}

type MandatoryFields = keyof Pick<GlobalContext, 'accessToken'>;

export function initialState({
  currentPage = routes.notAuthorized(),
  ...defaults
}: Pick<GlobalContext, MandatoryFields> &
  Partial<Omit<GlobalContext, MandatoryFields>>): GlobalContext {
  return { currentPage, ...defaults };
}

// -------------------------------------------------------------------------------------------------

export type Action = Partial<GlobalContext>;

const reducer = (state: GlobalContext | undefined, action: Action & { _init?: GlobalContext }) => {
  if (action._init) return action._init;
  if (state == null) return undefined;
  if ('accessToken' in action) {
    // It's ok to eventually persist the token, no need to wait until it happened.
    void task.run(api.settingWrite('accessToken', action.accessToken));
  }

  const nextState = { ...state, ...action };
  return equal(state, nextState) ? state : nextState;
};

// -------------------------------------------------------------------------------------------------

const context = React.createContext<[GlobalContext, React.Dispatch<Action>]>([
  initialState({
    currentPage: routes.notAuthorized(),
    accessToken: undefined,
  }),
  constVoid,
]);

export const GlobalContextProvider = React.memo(function GlobalContextProvider({
  children,
}: React.PropsWithChildren) {
  const [state, stateDispatch] = React.useReducer(reducer, undefined);

  useEffect(() => {
    if (state == null) {
      void pipe(
        api.settingRead('accessToken', AccessToken),
        task.map(option.toUndefined),
        task.map((accessToken) => stateDispatch({ _init: initialState({ accessToken }) })),
        task.run,
      );
    }
  }, [state]);

  return state == null
    ? React.createElement(Loading, { delayTime: 1000 })
    : React.createElement(context.Provider, { value: [state, stateDispatch] }, children);
});

// -------------------------------------------------------------------------------------------------

export const useGlobalContext = () => React.useContext(context)[0];

export const useGlobalContextWithActions = () => React.useContext(context);
