import { useCallback, useEffect, useRef } from 'react';

/**
 * Wraps `setTimeout`. Triggers the function after a given delay.
 * @param fn function to call
 * @param  delay in milliseconds
 */
export default function useTimeout(fn: () => void, delay = 0) {
  const savedCallback = useRef(fn);
  const timeout = useRef<NodeJS.Timeout>();
  const isMounted = useRef(false);

  savedCallback.current = fn;

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }
  }, []);

  const set = useCallback(() => {
    timeout.current = setTimeout(() => {
      savedCallback.current();
    }, delay);
  }, [delay]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      set();
    }
    return clear;
  }, [set, clear]);
}
