import normalizeException from 'normalize-exception';

export const fromThrown: (e: unknown) => Error = normalizeException;

export const toFatalError = (message: string): Error => {
  const error = new Error(message);
  error.name = 'Fatal error';
  return error;
};

/**
 * Immediately halts the program with an error message and stack trace.
 */
export function panic(message: string): never {
  throw toFatalError(message);
}

/**
 * Assert that the given condition will always hold, throw an invariant violation otherwise.
 */
export function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    const error = new Error(message);
    error.name = 'Invariant violation';
    throw error;
  }
}

/**
 * Assert that the given value is never null, throw an invariant violation otherwise.
 */
export function assertNonNull<A>(value: A, details?: string): asserts value is NonNullable<A> {
  invariant(value != null, ['Non-null assertion failed', details].filter(Boolean).join(': '));
}

/**
 * Assert that the given value is not null and return it, throw an invariant violation otherwise.
 */
export function requireNonNull<A>(value: A | null, details?: string): NonNullable<A> {
  assertNonNull(value, details);
  return value;
}
