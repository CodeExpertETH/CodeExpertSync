/* eslint-disable max-classes-per-file */
import { monoid, pipe, string } from '@code-expert/prelude';
import { isObject } from '@/utils/fn';

// -------------------------------------------------------------------------------------------------
// Types

export class UncaughtException extends Error {
  declare error: 'UncaughtException';

  declare reason: string;

  constructor(message: string, stack?: string) {
    super(message, { cause: stack });
  }
}

/**
 * If an invariant violation is thrown, it means that an assertion we assumed to
 * be true about our application didn't hold.
 */
export class InvariantViolation extends Error {
  declare error: 'InvariantViolation';

  declare reason: string;

  constructor(reason: string) {
    super(reason);
  }
}

export class EntityNotFoundException extends Error {
  declare error: 'EntityNotFound';

  declare reason: string;

  declare details: string;

  constructor(details: Record<string, unknown>, reason = 'Entity not found') {
    super(reason, { cause: JSON.stringify(details) });
  }
}

export class ValidationException extends Error {
  declare error: 'ValidationError';

  declare reason: string;

  declare details: string;

  constructor(errors: Array<string>, reason?: string) {
    const detailedReason =
      reason ??
      pipe(errors, monoid.concatAll(string.semicolonSeparated), (e) => `Validation failed: ${e}`);
    super(detailedReason, { cause: JSON.stringify(errors) });
  }
}

export const invalid = (errors: Array<string>, reason?: string) =>
  new ValidationException(errors, reason);

export const invariantViolated = (reason: string) => new InvariantViolation(reason);

export type Exception =
  | UncaughtException
  | InvariantViolation
  | EntityNotFoundException
  | ValidationException;

// -------------------------------------------------------------------------------------------------
// Functions

export function isError(err: unknown): err is Error {
  return isObject(err) && typeof err['name'] === 'string' && typeof err['message'] === 'string';
}

const exceptionTag: { [k in Exception['error']]: null } = {
  UncaughtException: null,
  InvariantViolation: null,
  EntityNotFound: null,
  ValidationError: null,
};

export function isException(err: unknown): err is Exception {
  return isObject(err) && typeof err['error'] === 'string' && err['error'] in exceptionTag;
}

/**
 * Assert that the given condition will always hold, throw an invariant violation otherwise.
 */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new InvariantViolation(
      ['Invariant assertion failed', message].filter(Boolean).join(': '),
    );
  }
}

export function fromError(err: unknown): Exception {
  if (isException(err)) return err;
  if (isError(err)) return new UncaughtException(err.message, err.stack);
  try {
    const message = typeof err === 'string' ? err : 'Unknown';
    return new UncaughtException(message, JSON.stringify(err));
  } catch (e) {
    assert(e instanceof Error);
    return new UncaughtException(e.message, e.stack);
  }
}

/**
 * Assert that the given value is never null, throw an invariant violation otherwise.
 */
export function assertNonNull<A>(value: A, message?: string): asserts value is NonNullable<A> {
  if (value == null) {
    throw new InvariantViolation(['Non-null assertion failed', message].filter(Boolean).join(': '));
  }
}

/**
 * Assert that the given value is not null and return it, throw an invariant violation otherwise.
 */
export function requireNonNull<A>(value: A | null, message?: string): NonNullable<A> {
  assertNonNull(value, message);
  return value;
}
