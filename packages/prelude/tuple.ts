import { $IntentionalAny } from '@code-expert/type-utils';
import { array, ord, tuple } from 'fp-ts';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { flow } from 'fp-ts/function';

import * as apply from './apply';
import { fn } from './function';

export * from 'fp-ts/Tuple';

export const sort3 = <A>(o: ord.Ord<A>): ((a: [A, A, A]) => [A, A, A]) =>
  array.sort(o) as $IntentionalAny;

export const sort4 = <A>(o: ord.Ord<A>): ((a: [A, A, A, A]) => [A, A, A, A]) =>
  array.sort(o) as $IntentionalAny;

/**
 * Sequence a pair.
 */
export function sequence2<F extends URIS2>(
  F: apply.Apply2<F>,
): <E, A, B>(t: [Kind2<F, E, A>, Kind2<F, E, B>]) => Kind2<F, E, [A, B]>;
export function sequence2<F extends URIS>(
  F: apply.Apply1<F>,
): <A, B>(t: [Kind<F, A>, Kind<F, B>]) => Kind<F, [A, B]>;
export function sequence2<F extends URIS>(
  F: apply.Apply1<F>,
): <A, B>(t: [Kind<F, A>, Kind<F, B>]) => Kind<F, [A, B]> {
  return fn.tupled(apply.sequence2(F));
}

/**
 * Traverse a pair.
 */
export function traverse2<F extends URIS2>(
  F: apply.Apply2<F>,
): <E, A, B>(f: (_: A) => Kind2<F, E, B>) => (t: [A, A]) => Kind2<F, E, [B, B]>;
export function traverse2<F extends URIS>(
  F: apply.Apply1<F>,
): <A, B>(f: (_: A) => Kind<F, B>) => (t: [A, A]) => Kind<F, [B, B]>;
export function traverse2<F extends URIS>(
  F: apply.Apply1<F>,
): <A, B>(f: (_: A) => Kind<F, B>) => (t: [A, A]) => Kind<F, [B, B]> {
  return (f) => flow(tuple.bimap(f, f), sequence2(F));
}
