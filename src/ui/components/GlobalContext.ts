import React, { useEffect } from 'react';
import equal from 'fast-deep-equal';
import { api } from 'api';
import { AuthToken } from '../../domain/AuthToken';
import { constVoid, option, pipe, task } from '../../prelude';
import Loading from './Loading';

export interface GlobalContext {
  readonly authToken?: AuthToken;
  readonly currentPage: string;
}

type MandatoryFields = keyof Pick<GlobalContext, 'authToken'>;

export function initialState({
  currentPage = 'main',
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
  if ('authToken' in action) {
    // It's ok to eventually persist the token, no need to wait until it happened.
    void task.run(api.settingWrite('authToken', action.authToken));
  }

  const nextState = { ...state, ...action };
  return equal(state, nextState) ? state : nextState;
};

// -------------------------------------------------------------------------------------------------

const context = React.createContext<[GlobalContext, React.Dispatch<Action>]>([
  initialState({
    currentPage: 'main',
    authToken: undefined,
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
        api.settingRead('authToken', AuthToken),
        task.map(option.toUndefined),
        task.map((authToken) => stateDispatch({ _init: initialState({ authToken }) })),
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
