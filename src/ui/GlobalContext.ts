import { $Unexpressable } from '@code-expert/type-utils';
import equal from 'fast-deep-equal';
import React, { useEffect } from 'react';
import { pipe, tagged, task } from '@code-expert/prelude';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { GlobalSetupState, getSetupState } from '@/domain/Setup';
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
  readonly projectRepository: ProjectRepository;
}

type MandatoryFields = keyof Pick<GlobalContext, 'setupState' | 'projectRepository'>;

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

const context = React.createContext<[GlobalContext, React.Dispatch<Action>]>(
  undefined as $Unexpressable /* Throw if no context is set */,
);

export const GlobalContextProvider = React.memo(function GlobalContextProvider({
  children,
  projectRepository,
}: React.PropsWithChildren<{ projectRepository: ProjectRepository }>) {
  const [state, stateDispatch] = React.useReducer(reducer, undefined);

  useEffect(() => {
    if (state == null) {
      void pipe(
        getSetupState(projectRepository),
        task.map((setupState) => {
          stateDispatch({
            _init: initialState({
              setupState,
              projectRepository,
            }),
          });
        }),
        task.run,
      );
    }
  }, [projectRepository, state]);

  return state == null
    ? React.createElement(Loading, { delayTime: 1000 })
    : React.createElement(context.Provider, { value: [state, stateDispatch] }, children);
});

// -------------------------------------------------------------------------------------------------

export const useGlobalContextWithActions = () => {
  const value = React.useContext(context);
  if (value == null)
    throw new Error(
      'GlobalContext needs to be defined before use. Did you forget to add a Provider? Or did you use it before it was initialised?',
    );
  return value;
};

export const useGlobalContext = () => useGlobalContextWithActions()[0];
