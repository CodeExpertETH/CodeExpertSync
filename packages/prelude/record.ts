export * from 'fp-ts/Record';

export const indexBy =
  <A, K extends string>(f: (a: A) => K) =>
  (as: Array<A>): Record<K, A> =>
    as.reduce((acc, current) => {
      acc[f(current)] = current;
      return acc;
    }, {} as Record<K, A>);

export const values: <K extends string, V>(r: Record<K, V>) => Array<V> = Object.values;

export const entries: <K extends string, V>(r: Record<K, V>) => Array<[K, V]> = Object.entries;
