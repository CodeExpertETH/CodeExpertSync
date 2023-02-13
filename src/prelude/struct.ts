import { identity } from 'fp-ts/function';
import * as R from 'fp-ts/Record';

export * from 'fp-ts/struct';

type EvolveTransformationsPartial<A> = { [K in keyof A]?: (a: A[K]) => unknown };

type EvolveResult<A, F extends EvolveTransformationsPartial<A>> = {
  [K in keyof A]: F extends Record<K, (a: A[K]) => infer R> ? R : A[K];
};

export const evolvePartial =
  <A, F extends EvolveTransformationsPartial<A>>(transformations: F) =>
  (a: A): EvolveResult<A, F> => {
    const out: Record<string, unknown> = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const k in a) {
      if (Object.prototype.hasOwnProperty.call(a, k)) {
        const transform = transformations[k] ?? identity;
        out[k] = transform(a[k]);
      }
    }
    return out as $Unexpressable;
  };

type RenameKey<A, KA extends keyof A, KB extends string> = Pick<A, Exclude<keyof A, KA>> & {
  [K in KB]: A[KA];
};

export const renameKey =
  <A extends Record<string, unknown>, KA extends keyof A, KB extends string>(ka: KA, kb: KB) =>
  (a: A): RenameKey<A, KA, KB> =>
    Object.fromEntries(Object.entries(a).map(([k, v]) => [k === ka ? kb : k, v])) as $Unexpressable;

export const modifyAt =
  <A, K extends keyof A>(k: K, f: (v: A[K]) => A[K]) =>
  (a: A) => ({
    ...a,
    [k]: f(a[k]),
  });

type KV<A, K extends keyof A = keyof A> = K extends unknown ? [key: K, value: A[K]] : never;
export const filterWithIndex: <A>(
  predicateWithIndex: (...kv: KV<A>) => boolean,
) => (fa: A) => Partial<A> = R.filterWithIndex as $Unexpressable;

type Entries<S extends Record<string, unknown>, K extends keyof S = keyof S> = K extends unknown
  ? [K, S[K]]
  : never;
export const entries: <S extends Record<string, unknown>>(s: S) => Array<Entries<S>> =
  Object.entries;
