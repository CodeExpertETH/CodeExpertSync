import fc from "fast-check";
import {
  apply,
  array,
  chain as chain_,
  eq,
  fn,
  FunctionN,
  functor,
  monad,
  pipe,
  predicate,
  record,
} from "../../prelude";
import * as pureRand from "pure-rand";
import { Endomorphism } from "fp-ts/Endomorphism";

export const URI = "Arbitrary";

export type URI = typeof URI;

declare module "fp-ts/HKT" {
  interface URItoKind<A> {
    readonly [URI]: fc.Arbitrary<A>;
  }
}

/**
 * Create a record of arbitraries. This is useful for creating arbitrary overrides.
 */
export type Overrides<A> = {
  [K in keyof A]?: fc.Arbitrary<A[K]>;
};

export const map =
  <A, B>(f: FunctionN<[A], B>): FunctionN<[fc.Arbitrary<A>], fc.Arbitrary<B>> =>
  (a) =>
    a.map(f);

export const ap: <A>(
  fa: fc.Arbitrary<A>
) => <B>(fab: fc.Arbitrary<(a: A) => B>) => fc.Arbitrary<B> = (fa) => (fab) =>
  fa.chain((a) => fab.map((f) => f(a)));

export const of: <A>(a: A) => fc.Arbitrary<A> = fc.constant;

export const chain =
  <A, B>(
    f: FunctionN<[A], fc.Arbitrary<B>>
  ): FunctionN<[fc.Arbitrary<A>], fc.Arbitrary<B>> =>
  (a) =>
    a.chain(f);

const _map: functor.Functor1<URI>["map"] = (fa, f) => pipe(fa, map(f));
const _ap: apply.Apply1<URI>["ap"] = (fab, fa) => pipe(fab, ap(fa));
const _chain: chain_.Chain1<URI>["chain"] = (ma, f) => pipe(ma, chain(f));

export const Functor: functor.Functor1<URI> = {
  URI,
  map: _map,
};

export const Chain: chain_.Chain1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

export const Monad: monad.Monad1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
  of,
};

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/ban-types
export const Do: fc.Arbitrary<{}> = of({});

export const bind = chain_.bind(Chain);

export const let_ = functor.let(Functor);

export { let_ as let };

export const bindTo = functor.bindTo(Functor);

export const getEq = <A>(eq: eq.Eq<A>): eq.Eq<fc.Arbitrary<A>> => ({
  equals(a, b) {
    const randomA = new fc.Random(pureRand.mersenne(42));
    const randomB = randomA.clone();
    // Compare 100 value pairs
    return pipe(
      array.makeBy<[A, A]>(100, () => [
        a.generate(randomA, undefined).value,
        b.generate(randomB, undefined).value,
      ]),
      array.every(fn.tupled(eq.equals))
    );
  },
});

type Arbitraries<A> = { [K in keyof A]: fc.Arbitrary<A[K]> };

const constants = <A extends Record<string, unknown>>(a: A): Arbitraries<A> =>
  pipe(a, record.map(fc.constant)) as $IntentionalAny; // FIXME cx-1551

/**
 * @deprecated Use {@link bind} instead.
 */
export const merge =
  <A extends Record<string, unknown>, B>(f: FunctionN<[A], Arbitraries<B>>) =>
  (arb: fc.Arbitrary<A>): fc.Arbitrary<A & B> =>
    arb.chain((a) =>
      fc.record({ ...constants(a), ...f(a) })
    ) as $IntentionalAny; // FIXME cx-1551

export const noShrink = <A>(a: fc.Arbitrary<A>): fc.Arbitrary<A> =>
  a.noShrink();

export const withOverrides =
  <A>(overrides?: Partial<A>): Endomorphism<fc.Arbitrary<A>> =>
  (a) =>
    a.map((base) => ({ ...base, ...overrides }));

export const filter =
  <A>(p: predicate.Predicate<A>): Endomorphism<fc.Arbitrary<A>> =>
  (a) =>
    a.filter(p);
