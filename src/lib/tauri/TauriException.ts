import { fromThrown } from '@/utils/error';

export class TauriException extends Error {
  name = 'TauriException' as const;
}

export const fromTauriError = (e: unknown): TauriException => {
  const error = fromThrown(e);
  const exception = new TauriException(error.message);
  exception.stack = error.stack;
  exception.cause = error.cause;
  return exception;
};
