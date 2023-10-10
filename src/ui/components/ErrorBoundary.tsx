import React from 'react';
import { fromThrown } from '@/utils/error';

/**
 * Capture the React component stack when an error occurs and throw it to
 * the application's boundary for handling.
 *
 * We don't make use of React's facilities for rendering a fallback UI in
 * the case of an error because we need a global error handler anyway, so
 * we use that instead.
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren> {
  componentDidCatch(thrown: unknown, { componentStack }: React.ErrorInfo) {
    const error = fromThrown(thrown);
    if (componentStack === null) {
      error.stack = undefined;
    } else {
      error.stack = componentStack;
    }
    throw error;
  }

  render() {
    return this.props.children;
  }
}
