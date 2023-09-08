import { useProperty } from '@frp-ts/react';
import { useEffect, useState } from 'react';
import { adt } from '@code-expert/prelude';
import { ApiConnectionProperty } from '@/infrastructure/tauri/ApiConnectionRepository';

export const isNavigator = typeof navigator !== 'undefined';

export interface NetworkStatus {
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

function getNetworkStatus(previousState?: NetworkStatus): NetworkStatus {
  const online = nav?.onLine ?? false;
  const previousOnline = previousState?.online ?? false;

  return {
    online,
    previous: previousOnline,
    since: online !== previousOnline ? new Date() : previousState?.since,
  };
}

export type ConnectionStatus = 'online' | 'noConnection' | 'noNetwork';

export const foldConnectionStatus = adt.foldFromKeys<ConnectionStatus>({
  online: null,
  noConnection: null,
  noNetwork: null,
});

export default function useConnectionStatus(
  apiConnectionProperty: ApiConnectionProperty,
): ConnectionStatus {
  const [networkAvailable, setNetworkAvailable] = useState(getNetworkStatus);
  const apiConnectionStatus = useProperty(apiConnectionProperty);

  useEffect(() => {
    const networkHandler = () => {
      setNetworkAvailable(getNetworkStatus);
    };

    window.addEventListener('online', networkHandler, { passive: true });
    window.addEventListener('offline', networkHandler, { passive: true });

    return () => {
      window.removeEventListener('online', networkHandler);
      window.removeEventListener('offline', networkHandler);
    };
  }, []);

  return networkAvailable.online && apiConnectionStatus === 'connected'
    ? 'online'
    : networkAvailable.online
    ? 'noConnection'
    : 'noNetwork';
}
