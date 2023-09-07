import { $Unexpressable } from '@code-expert/type-utils';
import equal from 'fast-deep-equal';
import React, { useEffect } from 'react';
import { pipe, task } from '@code-expert/prelude';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { GlobalSetupState, getSetupState, globalSetupState } from '@/domain/Setup';
import useNetworkState from '@/ui/hooks/useNetwork';
import { updateStateADT, useUpdate } from '@/ui/pages/update/hooks/useUpdate';
import { panic } from '@/utils/error';
import Loading from './components/Loading';

export interface GlobalContext {
  readonly setupState: GlobalSetupState;
  readonly projectRepository: ProjectRepository;
  readonly online: boolean;
}

type MandatoryFields = keyof Pick<GlobalContext, 'setupState' | 'projectRepository' | 'online'>;

export function initialState(
  defaults: Pick<GlobalContext, MandatoryFields> & Partial<Omit<GlobalContext, MandatoryFields>>,
): GlobalContext {
  return defaults;
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
  const updateState = useUpdate();

  const { online } = useNetworkState();

  useEffect(() => {
    if (state == null) {
      pipe(
        getSetupState(projectRepository),
        task.chainIOK((setupState) => () => {
          stateDispatch({
            _init: initialState({
              setupState,
              projectRepository,
              online,
            }),
          });
        }),
        task.run,
      );
    }
  }, [online, projectRepository, state]);

  useEffect(() => {
    void pipe(
      updateState,
      updateStateADT.fold({
        noUpdate: () => undefined,
        update: (manifest) => {
          if (state != null && state.setupState._tag !== 'update') {
            stateDispatch({
              _init: initialState({
                setupState: globalSetupState.update({ manifest }),
                projectRepository,
                online,
              }),
            });
          }
        },
      }),
    );
  }, [projectRepository, state, updateState, online]);

  return state == null
    ? React.createElement(Loading, { delayTime: 1000 })
    : React.createElement(context.Provider, { value: [state, stateDispatch] }, children);
});

// -------------------------------------------------------------------------------------------------

export const useGlobalContextWithActions = () => {
  const value = React.useContext(context);
  if (value == null)
    panic(
      'GlobalContext needs to be defined before use. Did you forget to add a Provider? Or did you use it before it was initialised?',
    );
  return value;
};

export const useGlobalContext = () => useGlobalContextWithActions()[0];
