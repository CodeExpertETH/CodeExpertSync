import {
  Identity,
  Kind,
  Kind2,
  URIS,
  URIS2,
  io,
  naturalTransformation as nt,
  string,
  task,
  taskEither,
} from '@code-expert/prelude';
import { notification as antdNotification } from 'antd';
import * as React from 'react';

import { Exception, fromError, isException } from '../../domain/exception';

antdNotification.config({
  placement: 'top',
});

export type Notification<F> = {
  /**
   * Show an error message.
   * If the argument is a string, it is shown.
   * If the argument is an exception, the message is shown.
   * Otherwise, the argument is converted from an error to an exception.
   */
  error(a: unknown, duration?: number): F;
  info(a: Content, duration?: number): F;
  success(a: Content, duration?: number): F;
  warning(a: Content, duration?: number): F;
};

declare module '../../../packages/prelude/naturalTransformation' {
  interface ServiceKind<F extends URIS> {
    Notification: Notification<Kind<F, void>>;
  }
  interface ServiceKind2<F extends URIS2, E> {
    Notification: Notification<Kind2<F, E, void>>;
  }
}

export type Content = React.ReactNode | string;

export type Notification1<F extends URIS> = Notification<Kind<F, void>>;
export type Notification2<F extends URIS2, E> = Notification<Kind2<F, E, void>>;

const exception = (e: Exception, duration?: number) =>
  void antdNotification.error({ message: e.message, duration });

export const notificationIO: Notification1<io.URI> = {
  error: (e, duration) => () =>
    string.isString(e) || React.isValidElement(e)
      ? void antdNotification.error({ message: e, duration })
      : isException(e)
      ? exception(e, duration)
      : exception(fromError(e), duration),
  info: (message, duration) => () => void antdNotification.info({ message, duration }),
  success: (message, duration) => () => void antdNotification.success({ message, duration }),
  warning: (message, duration) => () => void antdNotification.warning({ message, duration }),
};

export const notification: Notification1<Identity.URI> = nt.transform<
  'Notification',
  io.URI,
  Identity.URI
>(notificationIO, io.run);

export const notificationT: Notification1<task.URI> = nt.transform<
  'Notification',
  io.URI,
  task.URI
>(notificationIO, task.fromIO);

export const notificationTE = <E>(): Notification2<taskEither.URI, E> =>
  nt.transform<'Notification', io.URI, taskEither.URI, E>(notificationIO, taskEither.fromIO);
