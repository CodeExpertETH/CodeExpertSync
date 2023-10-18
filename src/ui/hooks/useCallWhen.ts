import React, { useEffect } from 'react';
import { io } from '@code-expert/prelude';

export const useCallWhen = (condition: boolean) => {
  const { current } = React.useRef({
    f: undefined as io.IO<void> | undefined,
    setF: (f?: io.IO<void>) => {
      current.f = f;
    },
  });
  useEffect(() => {
    if (condition) {
      current.f?.();
      current.setF();
    }
  }, [condition, current]);
  return current.setF;
};
