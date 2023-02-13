import React from 'react';
import copy from 'copy-to-clipboard';
import { io } from '../../prelude';
import { message } from 'antd';

export const copyToClipboard: (text: string) => io.IO<void> = (text) => () => {
  const didCopy = copy(text);
  if (didCopy) {
    return message.info('Copied to clipboard');
  } else {
    return message.error(
      <>
        Could not copy to clipboard, copy manually:
        <br />
        {text}
      </>,
      10,
    );
  }
};
