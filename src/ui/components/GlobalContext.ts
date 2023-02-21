import React, { useEffect } from 'react';
import equal from 'fast-deep-equal';
import { AuthToken } from '../../domain';
import { constVoid } from '../../prelude';
import { Store } from 'tauri-plugin-store-api';
import Loading from './Loading';

// -------------------------------------------------------------------------------------------------
const _store = new Store('.settings.dat');

export interface GlobalContext {
  readonly authToken?: AuthToken;
  readonly currentPage: string;

  readonly store: Store;
}

type MandatoryFields = keyof Pick<GlobalContext, 'authToken'>;

export function initialState({
  currentPage = 'main',
  store = _store,
  ...defaults
}: Pick<GlobalContext, MandatoryFields> &
  Partial<Omit<GlobalContext, MandatoryFields>>): GlobalContext {
  return { currentPage, store, ...defaults };
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
    currentPage: 'main',
    store: _store,
    authToken: undefined,
  }),
  constVoid,
]);

export const GlobalContextProvider = React.memo(function GlobalContextProvider({
  children,
}: React.PropsWithChildren) {
  const [state, stateDispatch] = React.useReducer(reducer, undefined);

  useEffect(() => {
    void _store.get('authToken').then((val) => {
      const nextState = {
        authToken: val == null ? undefined : (val as AuthToken),
      };
      const updateState =
        state == null
          ? {
              _init: initialState({
                ...nextState,
              }),
            }
          : nextState;

      return stateDispatch(updateState);
    });
  }, [state]);

  return state == null
    ? React.createElement(Loading, { delayTime: 1000 })
    : React.createElement(context.Provider, { value: [state, stateDispatch] }, children);
});

// -------------------------------------------------------------------------------------------------

export const useGlobalContext = () => React.useContext(context)[0];

export const useGlobalContextWithActions = () => React.useContext(context);
