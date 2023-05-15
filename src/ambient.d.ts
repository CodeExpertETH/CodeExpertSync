/**
 * The ambient.d.ts file exposes commonly used global types.
 */

interface NonEmptyArray<A> extends Array<A> {
  0: A;
}
