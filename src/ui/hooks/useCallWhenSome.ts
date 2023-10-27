import React, { useEffect } from 'react';
import { option } from '@code-expert/prelude';

export const useCallWhenSome = <A>(o: option.Option<A>) => {
  const { current } = React.useRef<{
    f: ((a: A) => void) | undefined;
    setF: (f: ((a: A) => void) | undefined) => void;
  }>({
    f: undefined,
    setF: (f) => {
      current.f = f;
    },
  });
  useEffect(() => {
    if (option.isSome(o)) {
      current.f?.(o.value);
      current.setF(undefined);
    }
  }, [o, current]);
  return current.setF;
};
