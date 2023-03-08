/* eslint-disable max-classes-per-file */
import { FunctionN, adt, array, monoid, pipe, string } from '@code-expert/prelude';

import { isObject } from '../utils/fn';

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

export class UnauthorizedException extends Error {
  declare error: 'UnauthorizedException';

  declare reason: string;

  constructor(reason = 'Access denied') {
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

export const entityNotFound = (details: Record<string, unknown>, reason?: string) =>
  new EntityNotFoundException(details, reason);

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

export const unauthorized = (reason?: string) => new UnauthorizedException(reason);

export const invalid = (errors: Array<string>, reason?: string) =>
  new ValidationException(errors, reason);

export const invariantViolated = (reason: string) => new InvariantViolation(reason);

export type Exception =
  | UncaughtException
  | InvariantViolation
  | UnauthorizedException
  | EntityNotFoundException
  | ValidationException;

// -------------------------------------------------------------------------------------------------
// Functions

export const foldException = adt.foldFromTags<Exception, 'error'>('error');

export const mapReason = (f: FunctionN<[string], string>) =>
  foldException<Exception>({
    UncaughtException: (e) => new UncaughtException(f(e.reason)),
    InvariantViolation: (e) => new InvariantViolation(f(e.reason)),
    EntityNotFound: (e) => new EntityNotFoundException(JSON.parse(e.details), f(e.reason)),
    ValidationError: (e) => new ValidationException(JSON.parse(e.details), f(e.reason)),
    UnauthorizedException: (e) => new UnauthorizedException(f(e.reason)),
  });

export function isError(err: $IntentionalAny): err is Error {
  return isObject(err) && typeof err['name'] === 'string' && typeof err['message'] === 'string';
}

const exceptionTag: { [k in Exception['error']]: null } = {
  UncaughtException: null,
  InvariantViolation: null,
  EntityNotFound: null,
  ValidationError: null,
  UnauthorizedException: null,
};

export function isException(err: $IntentionalAny): err is Exception {
  return err.error in exceptionTag;
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

/**
 * Assert that an array contains exactly one element.
 */
export function assertSingleton<A>(a: Array<A>, message?: string): asserts a is NonEmptyArray<A> {
  assert(array.isSingleton(a), message);
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

export function raiseError(err: unknown): never {
  throw err;
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

/**
 * Assert that the given value has been found, throw an entity-not-found exception otherwise.
 */
export function assertFound<A>(
  value: A,
  details: Record<string, unknown>,
): asserts value is NonNullable<A> {
  if (value == null) {
    throw new EntityNotFoundException(details);
  }
}
