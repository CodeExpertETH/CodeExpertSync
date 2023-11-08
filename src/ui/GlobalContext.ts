import equal from 'fast-deep-equal';
import React, { useEffect } from 'react';
import { pipe, task } from '@code-expert/prelude';
import { ProjectRepository } from '@/domain/ProjectRepository';
import { GlobalSetupState, getSetupState, globalSetupState } from '@/domain/Setup';
import { ApiConnectionAtom } from '@/infrastructure/tauri/ApiConnectionRepository';
import useConnectionStatus, { ConnectionStatus } from '@/ui/hooks/useNetwork';
import { updateStateADT, useUpdate } from '@/ui/pages/update/hooks/useUpdate';
import { panic } from '@/utils/error';
import Loading from './components/Loading';

export interface GlobalContext {
  readonly setupState: GlobalSetupState;
  readonly projectRepository: ProjectRepository;
  readonly apiConnectionAtom: ApiConnectionAtom;
  readonly connectionStatus: ConnectionStatus;
}

type MandatoryFields = keyof Pick<
  GlobalContext,
  'setupState' | 'projectRepository' | 'apiConnectionAtom' | 'connectionStatus'
>;

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

const context = React.createContext<[GlobalContext, React.Dispatch<Action>] | undefined>(undefined);

export const GlobalContextProvider = React.memo(function GlobalContextProvider({
  children,
  projectRepository,
  apiConnectionAtom,
}: React.PropsWithChildren<{
  projectRepository: ProjectRepository;
  apiConnectionAtom: ApiConnectionAtom;
}>) {
  const [state, stateDispatch] = React.useReducer(reducer, undefined);
  const updateState = useUpdate();
  const connectionStatus = useConnectionStatus(apiConnectionAtom);

  useEffect(() => {
    stateDispatch({ connectionStatus });
  }, [connectionStatus]);

  useEffect(() => {
    if (state == null) {
      pipe(
        getSetupState(projectRepository),
        task.chainIOK((setupState) => () => {
          stateDispatch({
            _init: initialState({
              setupState,
              projectRepository,
              apiConnectionAtom,
              connectionStatus,
            }),
          });
        }),
        task.run,
      );
    }
  }, [apiConnectionAtom, connectionStatus, projectRepository, state]);

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
                apiConnectionAtom,
                connectionStatus,
              }),
            });
          }
        },
      }),
    );
  }, [apiConnectionAtom, connectionStatus, projectRepository, state, updateState]);

  return state == null
    ? React.createElement(Loading, { delayTime: 1000 })
    : React.createElement(context.Provider, { value: [state, stateDispatch] }, children);
});

// -------------------------------------------------------------------------------------------------

export const useGlobalContextWithActions = () => {
  const value = React.useContext(context);
  if (value == null)
    panic(
      'GlobalContext needddds to be defined before use. Did you forget to add a Provider? Or did you use it before it was initialised?',
    );
  return value;
};

export const useGlobalContext = () => useGlobalContextWithActions()[0];
