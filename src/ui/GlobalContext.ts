import equal from 'fast-deep-equal';
import React, { useEffect } from 'react';
import { constVoid, pipe, tagged, task } from '@code-expert/prelude';
import { GlobalSetupState, getSetupState, globalSetupState, setupState } from '@/domain/Setup';
import Loading from './components/Loading';

export type Routes =
  | tagged.Tagged<'main'>
  | tagged.Tagged<'settings'>
  | tagged.Tagged<'logout'>
  | tagged.Tagged<'developer'>;

export const routes = tagged.build<Routes>();

export interface GlobalContext {
  readonly setupState: GlobalSetupState;
  readonly currentPage: Routes;
}

type MandatoryFields = keyof Pick<GlobalContext, 'setupState'>;

export function initialState({
  currentPage = routes.main(),
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

  const nextState = { ...state, ...action };
  return equal(state, nextState) ? state : nextState;
};

// -------------------------------------------------------------------------------------------------

const context = React.createContext<[GlobalContext, React.Dispatch<Action>]>([
  initialState({
    currentPage: routes.main(),
    setupState: globalSetupState.setup({ state: setupState.notAuthorized() }),
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
        getSetupState(),
        task.map((setupState) => {
          stateDispatch({
            _init: initialState({
              setupState,
            }),
          });
        }),
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
