import React from 'react';
import useTimeout from '../hooks/useTimeout';

/**
 * A Delayed Component which will render the children after waitBeforeShow time
 * @param props
 * @returns {null}
 * @constructor
 */
export function Delayed(props: React.PropsWithChildren<{ waitBeforeShow: number }>) {
  const [hidden, setHidden] = React.useState(true);

  useTimeout(() => {
    setHidden((h) => !h);
  }, props.waitBeforeShow);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{hidden ? null : props.children}</>;
}
