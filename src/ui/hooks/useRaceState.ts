import React, { SetStateAction } from 'react';

/**
 * Used similarly to the regular useState, this returns not a tuple
 * `[state: A, dispatch: Dispatch<A>]`, but a tuple `[state: A, getDispatch: () => Dispatch<A>]`.
 * The reason we do this is that there might be multiple possible dispatch functions floating around
 * in Promise callback closures, but we are really only interested in the result of the most
 * recently triggered Promise, i.e. the value passed to the dispatch function that was the last one
 * to be acquired via the `getDispatch`.
 *
 * This also works like useSafeState to prevent stateUpdates in unmounted components and also makes
 * use of the "inverted useRef" pattern described in useSafeState.
 *
 * @example
 * const [state, getDispatch] = useRaceState(...);
 * // when someDependency changes in quick succession and multiple fetches are triggered before
 * // the previous ones are finished, we won't have outdated state updates, because only the
 * // setState that was acquired last will actually do a state update.
 * useEffect(() => {
 *   const setState = getDispatch();
 *   fetch('https://example.com/api/calendar').then((r) => r.json).then(setState);
 * }, [someDependency])
 */
export function useRaceState<S>(
  initialState: S | (() => S),
): [S, () => React.Dispatch<SetStateAction<S>>];
export function useRaceState<S = undefined>(): [
  S | undefined,
  () => React.Dispatch<SetStateAction<S | undefined>>,
];
export function useRaceState<S>(
  initialState?: S | (() => S),
): [S | undefined, () => React.Dispatch<SetStateAction<S | undefined>>] {
  const [state, setState] = React.useState(initialState);

  const { current: meta } = React.useRef({
    isMounted: false,
    counter: 0,
    setState: (): React.Dispatch<SetStateAction<S | undefined>> => {
      const id = meta.counter + 1;
      meta.counter = id;
      return (dispatch) => {
        if (meta.isMounted && meta.counter === id) setState(dispatch);
      };
    },
  });

  React.useEffect(() => {
    meta.isMounted = true;
    return () => {
      meta.isMounted = false;
    };
  });

  return [state, meta.setState];
}
