import React from 'react';
import { Button, Result } from 'antd';
import { routes, useGlobalContextWithActions } from '../components/GlobalContext';
import { Icon } from '../foundation/Icons';

function WaitingForAuthorization() {
  const [, dispatchContext] = useGlobalContextWithActions();

  const onButtonClick = () => {
    dispatchContext({ currentPage: routes.notAuthorized() });
  };

  return (
    <Result
      title="Code Expert Desktop is waiting for authorization"
      subTitle="Please authorize Code Expert Desktop in Code Expert"
      icon={<Icon name="clock-regular" size="4x" />}
      extra={<Button onClick={onButtonClick}>Go back to authorize Code Expert Desktop</Button>}
    />
  );
}

export default WaitingForAuthorization;
