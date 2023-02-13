// -------------------------------------------------------------------------------------------------
// Algebraic Data Types (ADT) are a type of composite types, i.e. a type formed
// by combining other types. To work with such composite types, we need to get
// at the values they contain at one point. To do so, we can use the helper
// functions provided in this module.
//
// @see https://github.com/sledorze/morphic-ts/blob/master/packages/morphic-adt
// @see https://github.com/pfgray/ts-adt/
// -------------------------------------------------------------------------------------------------

import { Lazy } from 'fp-ts/function';

// -------------------------------------------------------------------------------------------------
// Type-level helpers

type Pattern<A extends Record<P, string>, P extends string, B> = {
  [T in A[P]]: (m: Extract<A, Record<P, T>>) => B;
};

type FoldProp<P extends string> = {
  <A extends Record<P, string>, B>(pattern: Pattern<A, P, B>): (a: A) => B;
  <A extends Record<P, string>, B>(a: A, pattern: Pattern<A, P, B>): B;
};

type FoldUnion<A extends Record<P, string>, P extends string> = {
  <B>(pattern: Pattern<A, P, B>): (a: A) => B;
  <B>(a: A, pattern: Pattern<A, P, B>): B;
};

// -------------------------------------------------------------------------------------------------
// Functions

export const foldFromProp = <P extends string>(p: P): FoldProp<P> => {
  const foldStrict = <A extends Record<P, string>, B>(
    ...args: [Pattern<A, P, B>] | [A, Pattern<A, P, B>]
  ) => {
    if (args.length === 1) {
      const [pattern] = args;
      return (value: A) => foldStrict(value, pattern);
    }

    const [value, pattern] = args;
    const tag = value[p];
    return pattern[tag](value as $Unexpressable);
  };
  return foldStrict;
};

/**
 * Build a function to pattern match on discriminated union type.
 *
 * @example: Data first
 * interface A { _tag: 'A', a: number }
 * interface B { _tag: 'B', b: string }
 * type MyType = A | B
 *
 * const foldMyType = foldFromTags<MyType>('_tag')
 * const result = foldMyType(
 *   { _tag: 'A', a: 1},
 *   {
 *     A: ({ a }) => a * 2,
 *     B: ({ b }) => parseInt(b, 10)
 *   }
 * )
 *
 * @example: Data last
 * interface A { _tag: 'A', a: number }
 * interface B { _tag: 'B', b: string }
 * type MyType = A | B
 *
 * const foldMyType = foldFromTags<MyType>('_tag')
 * const result = pipe(
 *   { _tag: 'A', a: 1},
 *   foldMyType({
 *     A: ({ a }) => a * 2,
 *     B: ({ b }) => parseInt(b, 10)
 *   })
 * )
 */
export const foldFromTags: <A extends Record<P, string>, P extends string>(
  p: P,
) => FoldUnion<A, P> = foldFromProp;

/**
 * Build a function to pattern match on a primitive union type (union of strings).
 *
 * @example: Data first
 * const foldMyUnion = foldFromKeys({ A: null, B: null })
 * const result = foldMyUnion('A', { A: () => 'a', B: () => 'b' })
 *
 * @example: Data last
 * const foldMyUnion = foldFromKeys({ A: null, B: null })
 * const result = pipe(
 *   'A',
 *   foldMyUnion({ A: () => 'a', B: () => 'b' })
 * )
 *
 * @example: Use the union's elements as an array
 * const foldMyUnion = foldFromKeys({ A: null, B: null })
 * const myUnionKeys = foldMyUnion.keys // -> ['A', 'B']
 */
export function foldFromKeys<K extends string | number>(spec: Record<K, unknown>) {
  function fold<A>(pattern: Record<K, Lazy<A>>): (key: K) => A;
  function fold<A>(key: K, pattern: Record<K, Lazy<A>>): A;
  function fold(arg1: $IntentionalAny, arg2?: $IntentionalAny): $IntentionalAny {
    if (arg2 == null) return (key: K) => fold(key, arg1);
    return arg2[arg1]();
  }
  fold.spec = spec;
  fold.keys = Object.keys(spec) as Array<K>;
  return fold as typeof fold & { spec: Record<K, null>; keys: Array<K> };
}

/**
 * A convenience type-level helper to extract the type from a folding function
 * that was built with `foldFromKeys`.
 *
 * @example
 * const foldMyUnion = foldFromKeys({ A: null, B: null })
 * type MyUnion = TypeOfKeys<typeof foldMyUnion> // "A" | "B"
 */
export type TypeOfKeys<
  R extends { spec: Record<K, unknown> },
  K extends keyof R['spec'] = keyof R['spec'],
> = K;

/**
 * Similar to tagged.build().is, this creates a record with type-refinements.
 *
 * @example
 * interface A { _tag: 'A', a: number }
 * interface B { _tag: 'B', b: string }
 * type AB = A | B
 *
 * const abIs = refinementFromProp<AB, '_tag'>('_tag');
 * declare const ab: AB;
 * if (abIs.B(ab)) {
 *   console.log(ab.b.toUpperCase())
 * }
 */
export const refinementFromProp = <A extends Record<P, string>, P extends keyof A>(p: P) => {
  const a = {} as { [V in A[P]]: <AA extends Pick<A, P>>(a: AA) => a is Extract<AA, Record<P, V>> };
  return new Proxy(a, {
    get(target, prop) {
      if (typeof prop !== 'string') return Reflect.get(target, prop);
      const pValue = prop as A[P];
      if (!(pValue in target)) {
        target[pValue] = ((a: $Unexpressable) => a[p] === pValue) as $Unexpressable;
      }
      return target[pValue];
    },
  });
};
