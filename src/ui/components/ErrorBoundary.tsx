import { Button, Collapse, Result, Typography, message } from 'antd';
import { api } from 'api';
import fromThrown from 'normalize-exception';
import React from 'react';
import { tagged } from '@code-expert/prelude';
import { VStack } from '@/ui/foundation/Layout';

type State =
  | tagged.Tagged<'ok'>
  | tagged.Tagged<'error', Error>
  | tagged.Tagged<'asyncError', Error>;

const stateADT = tagged.build<State>();

const logError = (error: Error) => {
  console.error(error); // TODO Add telemetry
};

/**
 * Error boundary
 * @see https://reactjs.org/docs/react-component.html#error-boundaries
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = stateADT.ok();

  static getDerivedStateFromError(thrown: unknown) {
    return stateADT.error(fromThrown(thrown));
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const error = fromThrown(event.reason);
    logError(error);
    this.setState(stateADT.asyncError(error));
  };

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentDidUpdate() {
    if (stateADT.is.asyncError(this.state)) {
      void message.error(this.state.value.message);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentDidCatch(thrown: unknown, { componentStack }: React.ErrorInfo) {
    const error = fromThrown(thrown);
    error.stack = componentStack;
    logError(error);
  }

  render() {
    if (stateADT.is.error(this.state)) {
      const { message, stack } = this.state.value;
      return (
        <VStack ph pb="lg">
          <Result
            status="error"
            title={'Code Expert Sync crashed'}
            subTitle={'Should the issue persist, please get in touch.'}
            extra={[
              <Button
                key="contact"
                href="https://docs.expert.ethz.ch/Contact-6d83eed1a848489f84ee9c008c597259"
                target="_blank"
              >
                Contact support
              </Button>,
              <Button key="reset" type="primary" onClick={() => api.restart()}>
                Reload
              </Button>,
            ]}
          />
          <Collapse
            items={[
              {
                key: 'details',
                label: 'Show error details',
                children: (
                  <>
                    <Typography.Title level={5}>Message</Typography.Title>
                    <Typography.Paragraph>{message}</Typography.Paragraph>
                    <Typography.Title level={5}>Stack trace</Typography.Title>
                    <pre>
                      <code>{stack}</code>
                    </pre>
                  </>
                ),
              },
            ]}
          />
        </VStack>
      );
    }
    return this.props.children;
  }
}
