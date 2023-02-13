/**
 * The ambient.d.ts file exposes commonly used global types.
 */

// -----------------------------------------------------------------------------
// TypeScript helpers

/** Fix this type, preferably before accepting the PR */
type $FixMe = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** This `any` is intentional, it never has to be fixed */
type $IntentionalAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** TS can't express the proper type at the moment */
type $Unexpressable = any; // eslint-disable-line @typescript-eslint/no-explicit-any

interface NonEmptyArray<A> extends Array<A> {
  0: A;
}
