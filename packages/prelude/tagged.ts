import { $IntentionalAny, $Unexpressable } from '@code-expert/type-utils';
import { Refinement } from 'fp-ts/Refinement';
import { Prism } from 'monocle-ts';
import { identity } from './function';
import * as option from './option';

/**
 * Tools for working with tagged unions.
 *
 * @example
 * type Num = tagged.Tagged<'num', number>;
 * type Str = tagged.Tagged<'str', string>;
 * type NumStr = Num | Str;
 * const numStr = tagged.build<NumStr>();
 * const one = numStr.num(1);
 * const hello = numStr.str('hello');
 * const fold = numStr.fold({
 *   num: (n) => n + 1,
 *   str: (s) => s.length,
 * });
 * const two = fold(one);
 * const five = fold(hello);
 */

/**
 * Declare a tagged union member.
 *
 * @example
 * type Num = tagged.Tagged<'num', number>; // { _tag: 'num'; value: number }
 */
export type Tagged<T, V = undefined> = [V] extends [undefined]
  ? { _tag: T }
  : {
      _tag: T;
      value: V;
    };

/**
 * Extract a member of a tagged union.
 *
 * @example
 * type T = tagged.Tagged<'num', number> | tagged.Tagged<'str', string>;
 * type N = tagged.Member<T, 'num'> // tagged.Tagged<'num', number>
 */
export type Member<A extends Tagged<string>, T extends A['_tag']> = Extract<A, Tagged<T>>;

/**
 * A function that can construct an instance of a tagged union member.
 *
 * @example
 * const num: Constructor<Num> = tagged.tag<Num>('num');
 * const one = num(1); // { _tag: 'num'; value: 1 }
 */
export type Constructor<A extends Tagged<string>> = A extends Tagged<string, infer V>
  ? (value: V) => A
  : () => A;

/**
 * A variant of Constructor that takes a specific members arguments but is typed to return a value
 * of the complete tagged union.
 *
 * @example
 * const num: WideConstructor<NumStr> = tagged.tag<Num>('num');
 * const one = num(1);
 * //    ^? NumStr
 */
export type WideConstructor<A extends Tagged<string>, AA extends A> = AA extends Tagged<
  string,
  infer V
>
  ? (value: V) => A
  : () => A;

// Constructor -----------------------------------------------------------------------------------

/**
 * Create a constructor for a specific tagged union member.
 *
 * @example
 * const num = tagged.tag<Num>('num');
 * const one = num(1) // { _tag: 'num', value: 1 }
 */
export const tag: <A extends Tagged<string>>(_tag: A['_tag']) => Constructor<A> = (_tag) =>
  ((...args: [unknown] | []) =>
    0 in args ? { _tag, value: args[0] } : { _tag }) as $Unexpressable;

// Fold ------------------------------------------------------------------------------------------

/**
 * A folding pattern for a tagged union A and a target type B.
 */
type Pattern<A extends Tagged<string>, B> = {
  [T in A['_tag']]: Member<A, T> extends Tagged<T, infer V> ? (v: V) => B : () => B;
};

/**
 * A folding function for a tagged union that is overloaded for data-first and data-last.
 */
type FoldStrict<A extends Tagged<string>> = {
  <B>(pattern: Pattern<A, B>): (a: A) => B;
  <B>(a: A, pattern: Pattern<A, B>): B;
};

/**
 * Fold over the values of a union of tagged objects.
 *
 * @example
 * const foldNumStr = tagged.fold<Num | Str>();
 * const dataLast = foldNumStr({
 *   Num: (n) => n + 1,
 *   Str: (s) => s.length,
 * });
 * const three = myFold(num(2));
 */
export const fold = <A extends Tagged<string>>(): FoldStrict<A> => {
  const foldStrict = <B>(...args: [Pattern<A, B>] | [A, Pattern<A, B>]) => {
    if (args.length === 1) {
      const [pattern] = args;
      return (data: A) => foldStrict(data, pattern);
    }
    const [data, pattern] = args;
    return pattern[data._tag as A['_tag']]((data as $IntentionalAny).value);
  };
  return foldStrict;
};

/**
 * Create a "Refinement" for a specific tagged union member.
 *
 * @example
 * const isNum = is<NumStr, Num>('num');
 * const a: NumStr = ...;
 * if (isNum(a)) {
 *   const { value } = a;
 *   //      ^? number
 * }
 */
export const is =
  <A extends Tagged<string>, AA extends A>(t: AA['_tag']): Refinement<A, AA> =>
  (a): a is AA =>
    a._tag === t;

// Build -----------------------------------------------------------------------------------------

/**
 * All instance constructors for a given tagged union.
 * @example
 * const numStr: Constructors<NumStr> = tagged.build<NumStr>();
 * const one = numStr.num(1);
 * const hello = numStr.str('hello');
 */
export type Constructors<A extends Tagged<string>> = {
  readonly [T in A['_tag']]: Constructor<Member<A, T>>;
};

/**
 * A variant of the tagged union's constructors which return the complete type instead of
 * the concrete type. This is useful if multiple instances of a union type are used in conjunction,
 * e.g. for error types.
 * @example
 * const numStrWide: WideConstructors<NumStr> = tagged.build<NumStr>().wide;
 * adt.fold({
 *   a: () => numStr.someError(),
 *   b: () => numStr.anotherError()
 * });
 */
export type WideConstructors<A extends Tagged<string>> = {
  readonly [T in A['_tag']]: WideConstructor<A, Member<A, T>>;
};

/**
 * All Refinements for a given algebra.
 * @example
 * const numStrRefinements: Refinements<NumStr> = tagged.build<NumStr>().is;
 * const a: NumStr = ...;
 * if (numStrRefinements.num(a)) {
 *   const { value } = a;
 *   //      ^? number
 * }
 *
 */
export type Refinements<A extends Tagged<string>> = {
  readonly [T in A['_tag']]: Refinement<A, Member<A, T>>;
};

/**
 * An algebra for a tagged union including narrow and widened constructors, a fold, and refinements.
 */
export type Algebra<A extends Tagged<string>> = Constructors<A> & {
  fold: FoldStrict<A>;
  is: Refinements<A>;
  wide: WideConstructors<A>;
};

const foldInstance = fold();

/**
 * Build an object containing constructors and a Fold for a union of tagged types.
 *
 * @example
 * const numStr = tagged.build<NumStr>();
 * const one = numStr.num(1);
 * const helloWorld = numStr.str('hello');
 * const fold = numStr.fold({
 *   num: (n) => n + 1,
 *   str: (s) => s.length,
 * });
 * const two = fold(one);
 * const five = fold(helloWorld);
 */
export const build = <A extends Tagged<string>>(): Algebra<A> => {
  const assertions = new Proxy({} as Refinements<A>, {
    get(asserts, prop) {
      if (typeof prop !== 'string') return Reflect.get(asserts, prop);
      const _tag = prop as A['_tag'];
      if (!(_tag in asserts)) {
        // eslint-disable-next-line no-param-reassign
        (asserts as $Unexpressable)[_tag] = is(_tag);
      }
      return asserts[_tag];
    },
  });

  const constructors = new Proxy({} as Constructors<A>, {
    get(constructors, prop) {
      const _tag = prop as A['_tag'];
      if (!(_tag in constructors)) {
        // eslint-disable-next-line no-param-reassign
        (constructors as $Unexpressable)[_tag] = tag(_tag);
      }
      return constructors[_tag];
    },
  });

  return new Proxy({} as Algebra<A>, {
    get(algebra, prop) {
      if (typeof prop !== 'string') return Reflect.get(algebra, prop);
      if (prop === 'fold') return foldInstance;
      if (prop === 'is') return assertions;
      if (prop === 'wide') return constructors;
      return constructors[prop as A['_tag']];
    },
  });
};

export type Prisms<A extends Tagged<string>> = {
  readonly [T in A['_tag']]: Prism<A, Member<A, T>>;
};

/**
 * Build a record of prisms to match the elements of a tagged type.
 *
 * @example
 * type NumStr = tagged.Tagged<'num', number> | tagged.Tagged<'str', string>;
 * const numStr = tagged.build<NumStr>();
 * const prisms = tagged.prisms<NumStr>();
 * prisms.num.getOption(numStr.num(1)) // some(1)
 * prisms.str.getOption(numStr.num(1)) // none
 */
export const prisms = <A extends Tagged<string>>(): Prisms<A> =>
  new Proxy({} as Prisms<A>, {
    get(prisms, prop) {
      const _tag = prop as A['_tag'];
      type T = typeof _tag;
      if (!(_tag in prisms)) {
        // eslint-disable-next-line no-param-reassign
        (prisms as $Unexpressable)[_tag] = new Prism<A, Member<A, T>>(
          option.fromPredicate((a): a is Member<A, T> => a._tag === _tag),
          identity,
        );
      }
      return prisms[_tag];
    },
  });
