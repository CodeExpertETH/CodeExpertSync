/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alt1 } from 'fp-ts/Alt';
import { Alternative1 } from 'fp-ts/Alternative';
import * as applicative from 'fp-ts/Applicative';
import { Applicative as ApplicativeHKT } from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';
import * as chainable from 'fp-ts/Chain';
import { Compactable1 } from 'fp-ts/Compactable';
import * as e from 'fp-ts/Either';
import { Eq } from 'fp-ts/Eq';
import { Extend1 } from 'fp-ts/Extend';
import { Filter1, Filterable1 } from 'fp-ts/Filterable';
import { Foldable1 } from 'fp-ts/Foldable';
import * as fe from 'fp-ts/FromEither';
import { Functor1 } from 'fp-ts/Functor';
import { HKT } from 'fp-ts/HKT';
import { Monad1 } from 'fp-ts/Monad';
import { Monoid } from 'fp-ts/Monoid';
import { Option, fold as foldO, none, some } from 'fp-ts/Option';
import { Ord } from 'fp-ts/Ord';
import { sign } from 'fp-ts/Ordering';
import { Pointed1 } from 'fp-ts/Pointed';
import { Predicate, not } from 'fp-ts/Predicate';
import { Refinement } from 'fp-ts/Refinement';
import { Semigroup } from 'fp-ts/Semigroup';
import { Separated, separated } from 'fp-ts/Separated';
import { Show } from 'fp-ts/Show';
import { PipeableTraverse1, Traversable1 } from 'fp-ts/Traversable';
import { Zero1 } from 'fp-ts/Zero';
import { LazyArg, constant, flow, identity, pipe } from 'fp-ts/function';

// TODO: Witherable

/**
 * @category Instances
 */
export const URI = 'Remote';

/**
 * @category Instances
 */
export type URI = typeof URI;

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    Remote: Remote<A>;
  }
}

/**
 * @category Model
 */
export interface Initial {
  readonly _tag: 'initial';
}

/**
 * @category Model
 */
export interface Pending {
  readonly _tag: 'pending';
}

/**
 * @category Model
 */
export interface Done<A> {
  readonly _tag: 'done';
  readonly value: A;
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of {@link Remote} is either an instance of {@link Initial}, {@link Pending} or {@link Done}
 *
 * The primary concern of {@link Remote} is modelling the states of an async operation, there is no error handling
 * included in this type. To model optionality or error states, take a look at
 * {@link import('../remote-either.ts') RemoteEither} or {@link import("../remote-option.ts") RemoteOption}.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 * @category Model
 */
export type Remote<A> = Initial | Pending | Done<A>;

/**
 * @category Constructors
 */
export const initial: Remote<never> = {
  _tag: 'initial',
};

/**
 * @category Constructors
 */
export const pending: Remote<never> = {
  _tag: 'pending',
};

/**
 * @category Constructors
 */
export const done = <A = never>(value: A): Remote<A> => ({
  _tag: 'done',
  value,
});

/**
 * @category Constructors
 */
export const of: <A>(value: A) => Remote<A> = done;

/**
 * @category Instances
 */
export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

/**
 * @category Constructors
 */
export const zero = <A>(): Remote<A> => initial;

/**
 * @category Instances
 */
export const Zero: Zero1<URI> = {
  URI,
  zero,
};

/**
 * @category Refinements
 */
export const isInitial = (data: Remote<unknown>): data is Initial => data._tag === 'initial';

/**
 * @category Refinements
 */
export const isPending = (data: Remote<unknown>): data is Pending => data._tag === 'pending';

/**
 * @category Refinements
 */
export const isDone = <A>(data: Remote<A>): data is Done<A> => data._tag === 'done';

/**
 * @category pattern matching
 */
export const foldW =
  <I, P, A, B>(onInitial: () => I, onPending: () => P, onDone: (value: A) => B) =>
  (ma: Remote<A>): I | P | B => {
    switch (ma._tag) {
      case 'initial': {
        return onInitial();
      }
      case 'pending': {
        return onPending();
      }
      case 'done': {
        return onDone(ma.value);
      }
    }
  };

/**
 * Needed for "unwrap" value from {@link Remote} "container".
 * It applies a function to each case in the data structure.
 *
 * @category pattern matching
 * @example
 * const onInitial = () => "it's initial"
 * const onPending = () => "it's pending"
 * const onDone = (data) => `${data + 1}`
 * const f = match(onInitial, onPending, onDone)
 *
 * f(initial) // "it's initial"
 * f(pending) // "it's pending"
 * f(done(21)) // '22'
 */
export const fold: <A, B>(
  onInitial: () => B,
  onPending: () => B,
  onDone: (value: A) => B,
) => (ma: Remote<A>) => B = foldW;

/**
 * @category mapping
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Remote<A>) => Remote<B> = (f) => (fa) =>
  isDone(fa) ? done(f(fa.value)) : fa;

/**
 * @category Instances
 */
export const Functor: Functor1<URI> = {
  URI,
  map: (fa, f) => pipe(fa, map(f)),
};

/**
 * @category utils
 */
export const ap: <A>(fa: Remote<A>) => <B>(fab: Remote<(a: A) => B>) => Remote<B> =
  (fa) => (fab) => {
    switch (fa._tag) {
      case 'initial': {
        return initial;
      }
      case 'pending': {
        return isInitial(fab) ? fab : fa;
      }
      case 'done': {
        return isDone(fab) ? done(fab.value(fa.value)) : fab;
      }
    }
  };

/**
 * @category Instances
 */
export const Apply: apply.Apply1<URI> = {
  ...Functor,
  ap: (fab, fa) => pipe(fab, ap(fa)),
};

/**
 * @category Instances
 */
export const Applicative: applicative.Applicative1<URI> = {
  ...Apply,
  ...Pointed,
};

/**
 * @category sequencing
 */
export const chain: <A, B>(f: (a: A) => Remote<B>) => (fa: Remote<A>) => Remote<B> = (f) => (fa) =>
  isDone(fa) ? f(fa.value) : fa;

/**
 * @category Instances
 */
export const Chain: chainable.Chain1<URI> = {
  ...Apply,
  chain: (fa, f) => pipe(fa, chain(f)),
};

/**
 * @category Instances
 */
export const Monad: Monad1<URI> = {
  ...Chain,
  ...Applicative,
};

/**
 * @category folding
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: Remote<A>) => B = (b, f) =>
  match2(
    () => b,
    (a) => f(b, a),
  );

/**
 * @category folding
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: Remote<A>) => B = (b, f) =>
  match2(
    () => b,
    (a) => f(a, b),
  );

/**
 * @category folding
 */
export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: Remote<A>) => M =
  (M) => (f) => (fa) =>
    isDone(fa) ? f(fa.value) : M.empty;

/**
 * @category Instances
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce: (fa, b, f) => pipe(fa, reduce(b, f)),
  reduceRight: (fa, b, f) => pipe(fa, reduceRight(b, f)),
  foldMap: (M) => (fa, f) => pipe(fa, foldMap(M)(f)),
};

/**
 * @category traversing
 */
export const traverse: PipeableTraverse1<URI> =
  <F>(F: applicative.Applicative<F>) =>
  <A, B>(f: (a: A) => HKT<F, B>) =>
  (ta: Remote<A>): HKT<F, Remote<B>> =>
    isDone(ta) ? F.map(f(ta.value), done) : F.of(initial);

/**
 * @category traversing
 */
export const sequence: Traversable1<URI>['sequence'] =
  <F>(F: applicative.Applicative<F>) =>
  <A>(ta: Remote<HKT<F, A>>): HKT<F, Remote<A>> =>
    isDone(ta) ? F.map(ta.value, done) : F.of(initial);

/**
 * @category Instances
 */
export const Traversable: Traversable1<URI> = {
  ...Functor,
  ...Foldable,
  sequence,
  traverse:
    <F>(F: ApplicativeHKT<F>) =>
    <A, B>(f: Remote<A>, fab: (a: A) => HKT<F, B>) =>
      pipe(f, traverse(F)(fab)),
};

/**
 * @category error handling
 */
export const alt: <B>(that: LazyArg<Remote<B>>) => <A>(self: Remote<A>) => Remote<A | B> =
  (that) => (self) =>
    isDone(self) ? self : that();

/**
 * @category Instances
 */
export const Alt: Alt1<URI> = {
  ...Functor,
  alt: (fa, that) => pipe(fa, alt(that)),
};

/**
 * @category Instances
 */
export const Alternative: Alternative1<URI> = {
  ...Applicative,
  ...Alt,
  ...Zero,
};

/**
 * @category utils
 */
export const extend: <A, B>(f: (fa: Remote<A>) => B) => (fa: Remote<A>) => Remote<B> =
  (f) => (fa) =>
    isDone(fa) ? done(f(fa)) : (fa as any);

/**
 * @category Instances
 */
export const Extend: Extend1<URI> = {
  ...Functor,
  extend: (wa, f) => pipe(wa, extend(f)),
};

/**
 * @category conversions
 */
export const fromEither: <E, A>(ea: e.Either<E, A>) => Remote<A> = e.fold(() => initial, done);

/**
 * @category Instances
 */
export const FromEither: fe.FromEither1<URI> = {
  URI,
  fromEither,
};

/**
 * @category utils
 */
export const apFirst = apply.apFirst(Apply);

/**
 * @category utils
 */
export const apSecond = apply.apSecond(Apply);

/**
 * @category do notation
 */
export const apS = apply.apS(Apply);

/**
 * @category do notation
 */
export const bind = chainable.bind(Chain);

/**
 * @category conversions
 */
export const fromOption: <A>(o: Option<A>) => Remote<A> = foldO(() => initial, done);

/**
 * @category conversions
 */
export const fromNullable: <A>(a: A) => Remote<NonNullable<A>> = (a) =>
  a != null ? done(a) : initial;

/**
 * @category conversions
 */
export const fromPredicate: {
  <A, B extends A>(refinement: Refinement<A, B>): (a: A) => Remote<B>;
  <A>(predicate: Predicate<A>): <B extends A>(b: B) => Remote<B>;
  <A>(predicate: Predicate<A>): (a: A) => Remote<A>;
} =
  <A>(predicate: Predicate<A>) =>
  (a: A) =>
    predicate(a) ? done(a) : initial;

/**
 * @category lifting
 */
export const liftEither = fe.fromEitherK(FromEither);

/**
 * @category lifting
 */
export const liftOption: <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Option<B>,
) => (...a: A) => Remote<B> = (f) => flow(f, fromOption);

/**
 * @category lifting
 */
export const liftNullable: <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => B | null | undefined,
) => (...a: A) => Remote<NonNullable<B>> = (f) => flow(f, fromNullable);

/**
 * @category filtering
 */
export const compact: <A>(fa: Remote<Option<A>>) => Remote<A> = chain(fromOption);

/**
 * @category internal
 */
const getLeft = <E, A>(ma: e.Either<E, A>): Remote<E> =>
  ma._tag === 'Right' ? initial : done(ma.left);

/**
 * @category internal
 */
const getRight = <E, A>(ma: e.Either<E, A>): Remote<A> =>
  ma._tag === 'Left' ? initial : done(ma.right);

/**
 * @category internal
 */
const defaultSeparated = separated(initial, initial);

/**
 * @category filtering
 */
export const separate: <A, B>(ma: Remote<e.Either<A, B>>) => Separated<Remote<A>, Remote<B>> = (
  ma,
) => (isDone(ma) ? separated(getLeft(ma.value), getRight(ma.value)) : defaultSeparated);

/**
 * @category Instances
 */
export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate,
};

/**
 * @category filtering
 */
export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (fa: Remote<A>) => Remote<B>;
  <A>(predicate: Predicate<A>): <B extends A>(fb: Remote<B>) => Remote<B>;
  <A>(predicate: Predicate<A>): (fa: Remote<A>) => Remote<A>;
} =
  <A>(predicate: Predicate<A>) =>
  (fa: Remote<A>) =>
    isDone(fa) && predicate(fa.value) ? fa : initial;

/**
 * @category internal
 */
const _filter: Filter1<URI> = <A>(fa: Remote<A>, predicate: Predicate<A>) =>
  pipe(fa, filter(predicate));

/**
 * @category filtering
 */
export const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (
    fa: Remote<A>,
  ) => Separated<Remote<A>, Remote<B>>;
  <A>(predicate: Predicate<A>): <B extends A>(fb: Remote<B>) => Separated<Remote<B>, Remote<B>>;
  <A>(predicate: Predicate<A>): (fa: Remote<A>) => Separated<Remote<A>, Remote<A>>;
} =
  <A>(predicate: Predicate<A>) =>
  (fa: Remote<A>) =>
    separated(_filter(fa, not(predicate)), _filter(fa, predicate));

/**
 * @category filtering
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => e.Either<B, C>,
) => (fa: Remote<A>) => Separated<Remote<B>, Remote<C>> = (f) => flow(map(f), separate);

/**
 * @category filtering
 */
export const filterMap: <A, B>(f: (a: A) => Option<B>) => (fa: Remote<A>) => Remote<B> =
  (f) => (fa) =>
    isDone(fa) ? fromOption(f(fa.value)) : initial;

/**
 * @category Instances
 */
export const Filterable: Filterable1<URI> = {
  ...Functor,
  ...Compactable,
  filter: _filter,
  filterMap: (fa, f) => pipe(fa, filterMap(f)),
  partition: <A>(fa: Remote<A>, predicate: Predicate<A>) => pipe(fa, partition(predicate)),
  partitionMap: (fa, f) => pipe(fa, partitionMap(f)),
};

/**
 * @category sequencing
 */
export const flatten: <A>(ffa: Remote<Remote<A>>) => Remote<A> = chain(identity);

/**
 * @category sequencing
 */
export const chainOptionK: <A, B>(f: (a: A) => Option<B>) => (ma: Remote<A>) => Remote<B> = flow(
  liftOption,
  chain,
);

/**
 * @category sequencing
 */
export const chainNullableK: <A, B>(
  f: (a: A) => B | undefined | null,
) => (ma: Remote<A>) => Remote<B> = flow(liftNullable, chain);

/**
 * @category sequencing
 */
export const chainEitherK: <A, B>(
  f: (a: A) => e.Either<unknown, B>,
) => (ma: Remote<A>) => Remote<B> = flow(liftEither, chain);

/**
 * @category sequencing
 */
export const chainFirst = chainable.chainFirst(Chain);

/**
 * @category sequencing
 */
export const chainFirstEitherK = fe.chainFirstEitherK(FromEither, Chain);

/**
 * @category sequencing
 */
export const chainFirstOptionK: <A>(f: (a: A) => Option<unknown>) => (fa: Remote<A>) => Remote<A> =
  flow(liftOption, chainFirst);

/**
 * @category Destructors
 */
export const getOrElseW: <B>(onNone: LazyArg<B>) => <A>(fa: Remote<A>) => A | B =
  (onNone) => (fa) =>
    isDone(fa) ? fa.value : onNone();

/**
 * Takes a default value as an argument.
 * If this {@link Remote} is "Left" part it will return default value.
 * If this {@link Remote} is {@link Done} it will return its value ("wrapped" value, not default value)
 *
 * Note: Default value should be the same type as {@link Remote} (internal) value, if you want to pass different type as default, use {@link fold}.
 *
 * @example
 * getOrElse(() => 999)(some(1)) // 1
 * getOrElseValue(() => 999)(initial) // 999
 *
 * @category Destructors
 */
export const getOrElse: <A>(f: LazyArg<A>) => (ma: Remote<A>) => A = getOrElseW;

/**
 * A more concise way to "unwrap" values from {@link Remote} "container".
 * It uses fold in its implementation, collapsing `onInitial` and `onPending` on the `onUnresolved` handler.
 * When fold's `onInitial` returns, `onNode` is called with `none`.
 *
 * @category pattern matching
 * @example
 * const onUnresolved = (progressOption) => "no data to show"
 * const onDone = (data) => `result is: ${data + 1}`
 * const f = match2(onUnresolved, onDone)
 *
 * assert.equal(f(initial), "no data to show");
 * assert.equal(f(pending), "no data to show");
 * assert.equal(f(done(21)), "result is: 22");
 */
export const match2 = <A, R>(onUnresolved: () => R, onDone: (a: A) => R): ((fa: Remote<A>) => R) =>
  fold(onUnresolved, onUnresolved, onDone);

/**
 * One more way to unwrap a value from {@link Remote}.
 * {@link Initial} and {@link Pending} will return `null`.
 * {@link Done} will return it's wrapped value.
 *
 * @category Destructors
 * @example
 * assert.equal(toNullable(done(2)), 2);
 * assert.equal(toNullable(initial), null);
 * assert.equal(toNullable(pending), null);
 */
export const toNullable = <A>(ma: Remote<A>): A | null => (isDone(ma) ? ma.value : null);

/**
 * @category Destructors
 */
export const toUndefined = <A>(ma: Remote<A>): A | undefined => (isDone(ma) ? ma.value : undefined);

/**
 * Convert {@link Remote} to {@link Option}
 * `Left` part will be converted to {@link import('fp-ts/Option').None None}.
 * {@link Done} will be converted to {@link import('fp-ts/Option').Some Some}.
 *
 * @category Destructors
 * @example
 * toOption(done(2)) // some(2)
 * toOption(initial) // none
 * toOption(pending) // none
 */
export const toOption: <A>(data: Remote<A>) => Option<A> = (data) =>
  isDone(data) ? some(data.value) : none;

/**
 * Convert {@link Remote} to `Either`.
 * {@link Initial} and {@link Pending} will be converted to `Left<L>`.
 * Since they do not have `E` values,
 * you must provide a value of type `E` that will be used to construct
 * the `Left<E>` for those two cases.
 * {@link Done} will be converted to `Right<A>`.
 *
 * @example:
 * const f = toEither(
 * 		() => new Error('Data not fetched'),
 * 		() => new Error('Data is fetching')
 * )
 * f(done(2)) // right(2)
 * f(initial) // right(Error('Data not fetched'))
 * f(pending) // right(Error('Data is fetching'))
 */
export const toEither: <E>(
  onInitial: () => E,
  onPending: () => E,
) => <A>(data: Remote<A>) => e.Either<E, A> = (onInitial, onPending) =>
  foldW(flow(onInitial, e.left), flow(onPending, e.left), e.right);

/**
 * Compare values and returns `true` if they are identical, otherwise returns `false`.
 * {@link Initial} and {@link Pending} will return `false`.
 * {@link Done} will call {@link Eq.equals}.
 *
 * If you want to compare {@link Remote}'s values better use {@link getEq} or {@link getOrd} helpers.
 *
 * @category utils
 */
export const elem: <A>(E: Eq<A>) => (a: A) => (fa: Remote<A>) => boolean = (E) => (a) => (fa) =>
  isDone(fa) && E.equals(a, fa.value);

/**
 * Takes a predicate and apply it to {@link Done} value.
 * {@link Initial} and {@link Pending} will return `false`.
 * @category utils
 */
export const exists: {
  <A, B extends A>(r: Refinement<A, B>): (fa: Remote<A>) => fa is Done<B>;
  <A>(p: Predicate<A>): <B extends A>(fa: Remote<B>) => boolean;
  <A>(p: Predicate<A>): (fa: Remote<A>) => boolean;
} =
  <A, B extends A>(predicate: Predicate<A>) =>
  (fa: Remote<A>): fa is Done<B> =>
    isDone(fa) && predicate(fa.value);

/**
 * @category Instances
 */
export const getEq = <A>(EA: Eq<A>): Eq<Remote<A>> => ({
  equals: (x, y) =>
    pipe(
      x,
      fold(
        () => isInitial(y),
        () => isPending(y),
        (ax) => isDone(y) && EA.equals(ax, y.value),
      ),
    ),
});

/**
 * @category Instances
 */
export const getMonoid = <A>(SA: Semigroup<A>): Monoid<Remote<A>> => ({
  concat: (x, y) => {
    switch (x._tag) {
      case 'initial': {
        return y;
      }
      case 'pending': {
        return isInitial(y) ? x : y;
      }
      case 'done': {
        return isDone(y) ? done(SA.concat(x.value, y.value)) : x;
      }
    }
  },
  empty: initial,
});

const constLt = constant(-1);
const constEq = constant(0);
const constGt = constant(1);
/**
 * @category Instances
 */
export const getOrd = <A>(OA: Ord<A>): Ord<Remote<A>> => ({
  ...getEq(OA),
  compare: (x, y) =>
    sign(
      pipe(
        x,
        fold(
          () => pipe(y, fold(constEq, constLt, constLt)),
          () => pipe(y, fold(constGt, constEq, constLt)),
          (xValue) =>
            pipe(
              y,
              fold(constGt, constGt, (yValue) => OA.compare(xValue, yValue)),
            ),
        ),
      ),
    ),
});

/**
 * @category Instances
 */
export const getShow = <A>(SA: Show<A>): Show<Remote<A>> => ({
  show: fold(
    () => 'initial',
    () => 'pending',
    (a) => `done(${SA.show(a)})`,
  ),
});

/**
 * @category traversing
 */
export const sequenceS = apply.sequenceS(Apply);

/**
 * @category traversing
 */
export const sequenceT = apply.sequenceT(Apply);

/**
 * @category traversing
 */
export const sequenceArray: <A>(rs: Array<Remote<A>>) => Remote<Array<A>> =
  array.sequence(Applicative);

/**
 * The order of parameters `next` and `current` comes from the fact that this is a similar operation
 * to `alt`. Additionally, doing it like this gives us an elegant way of building Dispatches/Reducers,
 * which is a pattern that sees a lot of use in React.
 *
 * @category Model
 */
export type RefreshStrategy = <A>(next: Remote<A>) => (current: Remote<A>) => Remote<A>;

/**
 * @category utils
 */
export const staleWhileRevalidate: RefreshStrategy = (next) => (current) =>
  pipe(
    next,
    fold(
      () => current,
      () => (isInitial(current) ? next : current),
      () => next,
    ),
  );
