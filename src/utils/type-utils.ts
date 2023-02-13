import { FunctionN } from 'fp-ts/function';

const BRAND = Symbol('brand');

export interface Nominal<A> {
  readonly [BRAND]: A;
}

/**
 * Create a nominal type
 * @example
 * type Id = Brand<string, 'id'>;
 * declare function withId(id: Id): void
 * withId('id1') // ERROR
 * withId('id1' as Id) // OK
 */
export type Brand<T, A> = T & Nominal<A>;

// -------------------------------------------------------------------------------------------------

/**
 * Unpack the type of the value in an array.
 *
 * Don't use this type unless the array values are generic.
 *
 * @example
 * // Don't do this
 * interface A {
 *   values: Array<{
 *     key: string;
 *   }>
 * }
 * type Elements = Unpack<A['values']>;
 *
 * // Do this instead
 * interface Elements {
 *   key: string;
 * }
 * interface A {
 *   values: Array<Elements>;
 * }
 *
 * // Or this
 * const randomOf = <A extends NonEmptyArray<unknown>>(...args: A): Unpack<A> =>
 *   args[Math.floor(Math.random() * args.length)];
 *
 * const value = randomOf(1, 2, 3, 4, 5);
 */
export type Unpack<A extends Array<unknown>> = A extends Array<infer V> ? V : never;

// -------------------------------------------------------------------------------------------------

/**
 * Unpack the type of the value in a Promise.
 */
export type ThenArg<P> = P extends PromiseLike<infer V> ? ThenArg<V> : P;

// -------------------------------------------------------------------------------------------------

/**
 * Given a record of records, discards the outer record's keys and turns the
 * inner record into a tuple where
 * - the first element is the (string) value in property K of the inner record,
 * - and the second element is the inner record's value.
 *
 * @example
 * type T = TuplesFromObject<{a: {id: 'A'}, b: {id: 'B', value: 1}}, 'id'>
 * // -> ["A", {id: 'A'}] | ['B', {id: 'B', value: 1}]
 *
 * @see https://stackoverflow.com/a/55454469
 */
export type TuplesFromObject<T, K extends string> = T extends Record<
  string,
  Record<K, $IntentionalAny>
>
  ? { [P in keyof T]: [T[P][K], T[P]] }[keyof T]
  : never;

/**
 * Get all values out of a record of records and turn them into a union type
 *
 * @example
 * type T = GetKeyByValue<{a: {id: 'A'}, b: {id: 'B', value: 1}}, 'id'>
 * // -> {id: "A"} | {id: "B", value: 1}
 *
 * @see https://stackoverflow.com/a/55454469
 */
export type GetKeyByValue<T, K extends string> = TuplesFromObject<T, K> extends infer TT
  ? TT extends [$IntentionalAny, infer A]
    ? A
    : never
  : never;

// -------------------------------------------------------------------------------------------------

export type DiscriminateUnion<
  Union,
  TagProp extends keyof Union,
  TagValue extends Union[TagProp],
> = Union extends Record<TagProp, TagValue> ? Union : never;

// -------------------------------------------------------------------------------------------------

/**
 * Turns a union of tagged types into a record where the key is the value of
 * the tag.
 *
 * @example
 * type T = MapDiscriminatedUnion<{id: 'A'} | {id: 'B', value: 1}, 'id'>
 * // -> { A: { id: 'A' }, B: { id: 'B', value: 1 }}
 *
 * @see https://stackoverflow.com/a/50125960
 */
export type MapDiscriminatedUnion<T extends Record<K, string>, K extends keyof T> = {
  [V in T[K]]: DiscriminateUnion<T, K, V>;
};

// -------------------------------------------------------------------------------------------------

/**
 * Like `keyof` but works on the union of its argument, instead of the intersection.
 * See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
 *
 * @example
 * type T = { name: 'a' } | { name: 'b', value: number }
 * type IntersectingKeys = keyof T
 * // -> 'name'
 *
 * type UnionKeys = DistributiveKeyof<T>
 * // -> 'name' | 'value'
 */
export type DistributiveKeyof<T> = T extends unknown ? keyof T : never;

// -------------------------------------------------------------------------------------------------

/**
 * Like `Pick` but works for union types.
 * See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
 *
 * @example
 * type T = { name: 'a' } | { name: 'b', value: number }
 * type IntersectingKeys = keyof T
 * // -> 'name'
 *
 * type UnionKeys = DistributiveKeyof<T>
 * // -> 'name' | 'value'
 */
export type DistributivePick<T, K extends DistributiveKeyof<T>> = T extends unknown
  ? [K & keyof T] extends [never]
    ? never
    : Pick<T, K & keyof T>
  : never;

/**
 * Like `Omit` but works for union types.
 * See https://github.com/microsoft/TypeScript/issues/28791#issuecomment-443520161
 */
export type DistributiveOmit<T, K extends keyof $IntentionalAny> = T extends T
  ? Pick<T, Exclude<keyof T, K>>
  : never;

// -------------------------------------------------------------------------------------------------

/**
 * Helper type for a unary function, produces a call signature with no params if the provided param is `undefined`.
 *
 * @example
 * type Func<A, B> = (a: A) => B;
 * declare const randInt: Func<undefined, number>;
 * randInt(); // -> Error: TS2554: Expected 1 arguments, but got 0.
 *
 * type NullableFunc<A, B> = ...
 * declare const randInt: NullableFunc<undefined, number>;
 * randInt(); // -> ok
 */
export type NullableFunc<A, B> = [A] extends [undefined | null | void] ? () => B : (a: A) => B;

// -------------------------------------------------------------------------------------------------

/**
 * Get all values out of a record.
 *
 * @example
 * type T = GetRecordValue<{a: {id: 'A'}, b: {id: 'B', value: 1}}>
 * // -> {id: "A"} | {id: "B", value: 1}
 */
export type GetRecordValue<R> = R extends Record<string | number | symbol, infer V> ? V : never;

// -------------------------------------------------------------------------------------------------

/**
 * Discards all readonly modifiers.
 *
 * @example
 * const selector: Mutable<Selector<Message>> = {};
 * selector.$or = [...];
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// -------------------------------------------------------------------------------------------------

/**
 * Builds a list of all possible property paths
 *
 * @example
 * interface MyEntity {
 *   a: {
 *     A: string;
 *     B: {
 *       C: string;
 *       E: string;
 *     }
 *   }
 *   b: {
 *     D: string;
 *   }
 * }
 * PathsOf<MyEntity>;
 * // -> 'a' | 'a.A' | 'a.B' | 'a.B.C' | 'a.B.E' | 'b' | 'b.D'
 */
export type PathOf<A> = PathOf_<Required<A>>;
type PathOf_<A, K extends keyof A = keyof A> = K extends string
  ? A[K] extends Record<string, unknown>
    ? K | `${K}.${PathOf<A[K]>}`
    : K
  : never;

// -------------------------------------------------------------------------------------------------

/**
 * Extract all prefixes from a union of paths
 *
 * @example
 * Prefix<'a.A' | 'a.B.C' | 'b.D'>
 * // -> 'a' | 'b'
 */
type Prefix<P> = P extends `${infer Pfx}.${string}` ? Pfx : never;

/**
 * Extract all continuations of a given prefix from a union of paths
 *
 * @example
 * SubPath<'a.A' | 'a.B.C' | 'b.D', 'a'>
 * // -> 'A' | 'B.C'
 */
type SubPath<P, Pfx extends string> = P extends `${Pfx}.${infer SP}` ? SP : never;

/**
 * Given a union of paths, build a mapping from prefixes to their continuations
 *
 * @example
 * GroupPrefix<'a.A' | 'a.B.C' | 'b.D'>
 * // -> { a: 'A' | 'B.C'; b: 'D' }
 */
type GroupPrefix<P> = { [Pfx in Prefix<P>]: SubPath<P, Pfx> };

export type PickPath<A, P extends PathOf<A>> = PickPath_<A, P>;
type PickPath_<A, P, GP = GroupPrefix<P>> = Pick<A, P & keyof A> & {
  [Pfx in keyof Pick<A, keyof A & keyof GP>]: PickPath_<NonNullable<A[Pfx]>, GP[Pfx]>;
};

// -------------------------------------------------------------------------------------------------

/**
 * Combination of DistributiveKeyof and PathOf. Implementation is identical to DistributiveKeyof,
 * but replacing keyof with PathOf.
 */
export type DistributivePathOf<A> = A extends unknown ? PathOf_<A> : never;

// -------------------------------------------------------------------------------------------------

/**
 * Combination of DistributivePick and PickPath. Implementation is identical to DistributivePick,
 * but replacing keyof with PathOf and Pick with PickPath.
 */
export type DistributivePickPath<A, P extends DistributivePathOf<A>> = A extends unknown
  ? [P & PathOf<A>] extends [never]
    ? never
    : PickPath_<A, P>
  : never;

// -------------------------------------------------------------------------------------------------

export type DistributiveGet<T, K extends DistributiveKeyof<T>> = T extends unknown
  ? T[K & keyof T]
  : never;

// -------------------------------------------------------------------------------------------------

export type MergeNDU<T> = { [K in keyof T]: T[K] } & {
  [K in DistributiveKeyof<T>]?: DistributiveGet<T, K>;
};

// -------------------------------------------------------------------------------------------------

export type ReplaceProps<T, U extends Partial<Record<keyof T, unknown>>> = Omit<T, keyof U> & U;

// -------------------------------------------------------------------------------------------------

export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

// -------------------------------------------------------------------------------------------------

export type PartialProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// -------------------------------------------------------------------------------------------------

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

// -------------------------------------------------------------------------------------------------

/**
 * Pick the keys of a record with a particular value type.
 * https://stackoverflow.com/a/53835427
 */
export type KeysOfValue<T, V extends T[keyof T]> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

// -------------------------------------------------------------------------------------------------

/**
 * Allow only some fields from a record, but make sure there is at least one field present.
 * Without this, a type of `{}` is possible, which lets anything through and is often undesired.
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> &
  { [K in Keys]: Required<Pick<T, K>> }[Keys];

/**
 * Filter a record `R` to only keep fields that have a value of type `A`.
 *
 * @example
 * type Rec = { a: number; b: string }
 * type FilteredRec = KeepFieldsOfValue<Rec, number> // { a: number }
 */
export type KeepFieldsOfValue<R, A> = {
  [K in keyof R as R[K] extends A ? K : never]: R[K] extends A ? R[K] : never;
};

// -------------------------------------------------------------------------------------------------

/**
 * Replace the return type of a function.
 */
export type ReplaceReturnType<F, R> = F extends FunctionN<infer A, unknown>
  ? FunctionN<A, R>
  : never;
