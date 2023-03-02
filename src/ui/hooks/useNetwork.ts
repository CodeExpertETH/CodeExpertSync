import { useEffect, useState } from 'react';

export const isNavigator = typeof navigator !== 'undefined';

export interface UseNetworkState {
  /**
   * @desc Whether browser connected to the network or not.
   */
  online: boolean;
  /**
   * @desc Previous value of `online` property. Helps to identify if browser
   * just connected or lost connection.
   */
  previous: boolean;
  /**
   * @desc The {Date} object pointing to the moment when state change occurred.
   */
  since: Date | undefined;
}

const nav: Navigator | undefined = isNavigator ? navigator : undefined;

function getConnectionState(previousState?: UseNetworkState): UseNetworkState {
  const online = nav?.onLine ?? false;
  const previousOnline = previousState?.online ?? false;

  return {
    online,
    previous: previousOnline,
    since: online !== previousOnline ? new Date() : previousState?.since,
  };
}

export default function useNetworkState(initialState?: () => UseNetworkState): UseNetworkState {
  const [state, setState] = useState(initialState ?? getConnectionState);

  useEffect(() => {
    const handleStateChange = () => {
      setState(getConnectionState);
    };

    window.addEventListener('online', handleStateChange, { passive: true });
    window.addEventListener('offline', handleStateChange, { passive: true });

    return () => {
      window.removeEventListener('online', handleStateChange);
      window.removeEventListener('offline', handleStateChange);
    };
  }, []);

  return state;
}
