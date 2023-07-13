import { Alt1 } from 'fp-ts/Alt';
import { Alternative1 } from 'fp-ts/Alternative';
import * as applicative from 'fp-ts/Applicative';
import * as apply from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';
import { Chain1 } from 'fp-ts/Chain';
import { Compactable1 } from 'fp-ts/Compactable';
import { Either, fold as foldEither, left, right } from 'fp-ts/Either';
import { Eq } from 'fp-ts/Eq';
import { Filter1, Filterable1 } from 'fp-ts/Filterable';
import { Foldable1 } from 'fp-ts/Foldable';
import { FromEither1 } from 'fp-ts/FromEither';
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
import { Lazy, LazyArg, constFalse, constant, flow, pipe } from 'fp-ts/function';

export const URI = 'Remote';
export type URI = typeof URI;
declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    Remote: Remote<A>;
  }
}

export interface Initial {
  readonly _tag: 'initial';
}

export interface Pending {
  readonly _tag: 'pending';
}

export interface Done<A> {
  readonly _tag: 'done';
  readonly value: A;
}

/**
 * Represents a value of one of four possible types (a disjoint union)
 *
 * An instance of {@link Remote} is either an instance of {@link Initial}, {@link Pending} or {@link Done}
 *
 * A common use of {@link Remote} is as an alternative to `Either` or `Option` supporting initial and pending states (fits best with [RXJS]{@link https://github.com/ReactiveX/rxjs/}).
 *
 * Note: {@link Initial} {@link Pending} are commonly called "Left" part in jsDoc.
 *
 * @see https://medium.com/@gcanti/slaying-a-ui-antipattern-with-flow-5eed0cfb627b
 *
 */
export type Remote<A> = Initial | Pending | Done<A>;

export const done = <A = never>(value: A): Remote<A> => ({
  _tag: 'done',
  value,
});
export const pending: Remote<never> = {
  _tag: 'pending',
};
export const initial: Remote<never> = {
  _tag: 'initial',
};

/**
 * Returns true only if {@link Remote} is {@link Done}
 */
export const isDone = <A>(data: Remote<A>): data is Done<A> => data._tag === 'done';

/**
 * Returns true only if {@link Remote} is {@link Pending}
 */
export const isPending = (data: Remote<unknown>): data is Pending => data._tag === 'pending';

/**
 * Returns true only if {@link Remote} is {@link Initial}
 */
export const isInitial = (data: Remote<unknown>): data is Initial => data._tag === 'initial';

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
 */
export const getOrElse =
  <A>(f: Lazy<A>) =>
  (ma: Remote<A>): A =>
    isDone(ma) ? ma.value : f();

/**
 * Needed for "unwrap" value from {@link Remote} "container".
 * It applies a function to each case in the data structure.
 *
 * @example
 * const onInitial = () => "it's initial"
 * const onPending = () => "it's pending"
 * const onDone = (data) => `${data + 1}`
 * const f = fold(onInitial, onPending, onFailure, onDone)
 *
 * f(initial) // "it's initial"
 * f(pending) // "it's pending"
 * f(done(21)) // '22'
 */
export const matchW =
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

export const match: <A, B>(
  onInitial: () => B,
  onPending: () => B,
  onDone: (value: A) => B,
) => (ma: Remote<A>) => B = matchW;

export const fold = match;

/**
 * A more concise way to "unwrap" values from {@link Remote} "container".
 * It uses fold in its implementation, collapsing `onInitial` and `onPending` on the `onNone` handler.
 * When fold's `onInitial` returns, `onNode` is called with `none`.
 *
 * @example
 * const onNone = (progressOption) => "no data to show"
 * const onDone = (data) => `result is: ${data + 1}`
 * const f = fold(onInitial, onPending, onDone)
 *
 * f(initial) // "no data to show"
 * f(pending) // "no data to show"
 * f(done(21)) // "result is: 22"
 */
export const fold2 = <A, R>(onNone: () => R, onDone: (a: A) => R): ((fa: Remote<A>) => R) =>
  fold(onNone, onNone, onDone);

/**
 * One more way to fold (unwrap) value from {@link Remote}.
 * `Left` part will return `null`.
 * {@link Done} will return value.
 *
 * For example:
 *
 * `toNullable(done(2)) will return 2`
 *
 * `toNullable(initial) will return null`
 *
 * `toNullable(pending) will return null`
 *
 */
export const toNullable = <A>(ma: Remote<A>): A | null => (isDone(ma) ? ma.value : null);

export const toUndefined = <A>(ma: Remote<A>): A | undefined => (isDone(ma) ? ma.value : undefined);

export const fromOption: <A>(o: Option<A>) => Remote<A> = foldO(() => initial, done);

/**
 * Convert {@link Remote} to {@link import('fp-ts/Option').Option Option}
 * `Left` part will be converted to {@link import('fp-ts/Option').None None}.
 * {@link Done} will be converted to {@link import('fp-ts/Option').Some Some}.
 *
 * @example
 * toOption(done(2)) // some(2)
 * toOption(initial) // none
 * toOption(pending) // none
 */
export const toOption: <A>(data: Remote<A>) => Option<A> = (data) =>
  isDone(data) ? some(data.value) : none;

/**
 * Creates {@link Remote} from {@link Either}
 */
export const fromEither: <E, A>(ea: Either<E, A>) => Remote<A> = foldEither(() => initial, done);

/**
 * Convert {@link Remote} to `Either`.
 * `Left` part will be converted to `Left<L>`.
 * Since {@link Initial} and {@link Pending} do not have `L` values,
 * you must provide a value of type `L` that will be used to construct
 * the `Left<L>` for those two cases.
 * {@link Done} will be converted to `Right<R>`.
 *
 * @example:
 * const f = toEither(
 * 		() => new Error('Data not fetched'),
 * 		() => new Error('Data is fetching')
 * )
 * f(done(2)) // right(2)
 * f(initial) // right(Error('Data not fetched'))
 * f(pending) // right(Error('Data is fetching'))
 * f(failure(new Error('error text'))) // right(Error('error text'))
 */
export function toEither<E>(
  onInitial: () => E,
  onPending: () => E,
): <A>(data: Remote<A>) => Either<E, A> {
  return (data) =>
    pipe(
      data,
      fold(
        () => left(onInitial()),
        () => left(onPending()),
        right,
      ),
    );
}

export const fromPredicate: <A>(predicate: Predicate<A>) => (a: A) => Remote<A> =
  (predicate) => (a) =>
    predicate(a) ? done(a) : initial;

export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (fa: Remote<A>) => Remote<B>;
  <A>(predicate: Predicate<A>): <B extends A>(fb: Remote<B>) => Remote<B>;
  <A>(predicate: Predicate<A>): (fa: Remote<A>) => Remote<A>;
} =
  <A>(predicate: Predicate<A>) =>
  (fa: Remote<A>) =>
    isDone(fa) && predicate(fa.value) ? fa : initial;

/**
 * Compare values and returns `true` if they are identical, otherwise returns `false`.
 * `Left` part will return `false`.
 * {@link Done} will call {@link Eq.equals}.
 *
 * If you want to compare {@link Remote}'s values better use {@link getEq} or {@link getOrd} helpers.
 *
 */
export const elem: <A>(E: Eq<A>) => (a: A) => (fa: Remote<A>) => boolean = (E) => (a) => (fa) =>
  isDone(fa) && E.equals(a, fa.value);

/**
 * Takes a predicate and apply it to {@link Done} value.
 * `Left` part will return `false`.
 */
export const exists: {
  <A, B extends A>(r: Refinement<A, B>): (fa: Remote<A>) => fa is Done<B>;
  <A>(p: Predicate<A>): (fa: Remote<A>) => boolean;
} =
  <A, B extends A>(predicate: Predicate<A>) =>
  (fa: Remote<A>): fa is Done<B> =>
    isDone(fa) && predicate(fa.value);

const _map: Monad1<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _ap: Monad1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _chain: Monad1<URI>['chain'] = (fa, f) => pipe(fa, chain(f));
const _reduce: Foldable1<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f));
const _reduceRight: Foldable1<URI>['reduceRight'] = (fa, b, f) => pipe(fa, reduceRight(b, f));
const _foldMap: <M>(M: Monoid<M>) => <A>(fa: Remote<A>, f: (a: A) => M) => M = (M) => (fa, f) =>
  pipe(fa, foldMap(M)(f));
const _traverse: Traversable1<URI>['traverse'] =
  <F>(F: applicative.Applicative<F>) =>
  <A, B>(ta: Remote<A>, f: (a: A) => HKT<F, B>) =>
    pipe(ta, traverse(F)(f));
const _alt: Alt1<URI>['alt'] = (self, that) => pipe(self, alt(that));
const _filter: Filter1<URI> = <A>(fa: Remote<A>, predicate: Predicate<A>) =>
  pipe(fa, filter(predicate));
const _filterMap: Filterable1<URI>['filterMap'] = (fa, f) => pipe(fa, filterMap(f));
const _partition: Filterable1<URI>['partition'] = <A>(fa: Remote<A>, predicate: Predicate<A>) =>
  pipe(fa, partition(predicate));
const _partitionMap: Filterable1<URI>['partitionMap'] = (fa, f) => pipe(fa, partitionMap(f));

export const zero = <A>(): Remote<A> => initial;

export const of: <A>(value: A) => Remote<A> = done;

export const map: <A, B>(f: (a: A) => B) => (fa: Remote<A>) => Remote<B> = (f) => (fa) =>
  isDone(fa) ? done(f(fa.value)) : fa;

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

export const chain: <A, B>(f: (a: A) => Remote<B>) => (fa: Remote<A>) => Remote<B> = (f) => (fa) =>
  isDone(fa) ? f(fa.value) : fa;

export const chainFirst: <A, B>(f: (a: A) => Remote<B>) => (fa: Remote<A>) => Remote<A> =
  (f) => (fa) => {
    if (isDone(fa)) {
      const f2 = f(fa.value);
      if (isDone(f2)) return fa;
      return f2;
    }
    return fa;
  };

export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: Remote<A>) => B = (b, f) =>
  fold(
    () => b,
    () => b,
    (a) => f(b, a),
  );

export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: Remote<A>) => B = (b, f) =>
  fold(
    () => b,
    () => b,
    (a) => f(a, b),
  );

export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: Remote<A>) => M =
  (M) => (f) => (fa) =>
    isDone(fa) ? f(fa.value) : M.empty;

export const traverse: PipeableTraverse1<URI> =
  <F>(F: applicative.Applicative<F>) =>
  <A, B>(f: (a: A) => HKT<F, B>) =>
  (ta: Remote<A>): HKT<F, Remote<B>> =>
    isDone(ta) ? F.map(f(ta.value), done) : F.of(initial);

export const sequence: Traversable1<URI>['sequence'] =
  <F>(F: applicative.Applicative<F>) =>
  <A>(ta: Remote<HKT<F, A>>): HKT<F, Remote<A>> =>
    isDone(ta) ? F.map(ta.value, done) : F.of(initial);

export const alt: <B>(that: LazyArg<Remote<B>>) => <A>(self: Remote<A>) => Remote<A | B> =
  (that) => (self) =>
    isDone(self) ? self : that();

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

export const partitionMap: <A, B, C>(
  f: (a: A) => Either<B, C>,
) => (fa: Remote<A>) => Separated<Remote<B>, Remote<C>> = (f) => flow(map(f), separate);

export const filterMap: <A, B>(f: (a: A) => Option<B>) => (fa: Remote<A>) => Remote<B> =
  (f) => (fa) =>
    isDone(fa) ? fromOption(f(fa.value)) : initial;

export const compact: <A>(fa: Remote<Option<A>>) => Remote<A> = chain(fromOption);

export const getLeft = <E, A>(ma: Either<E, A>): Remote<E> =>
  ma._tag === 'Right' ? initial : done(ma.left);

export const getRight = <E, A>(ma: Either<E, A>): Remote<A> =>
  ma._tag === 'Left' ? initial : done(ma.right);

const defaultSeparated = separated(initial, initial);
export const separate: <A, B>(ma: Remote<Either<A, B>>) => Separated<Remote<A>, Remote<B>> = (ma) =>
  isDone(ma) ? separated(getLeft(ma.value), getRight(ma.value)) : defaultSeparated;

export const Alt: Alt1<URI> = {
  URI,
  map: _map,
  alt: _alt,
};

export const Alternative: Alternative1<URI> = {
  URI,
  map: _map,
  alt: _alt,
  zero,
  of,
  ap: _ap,
};

export const Applicative: applicative.Applicative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
};

export const Apply: apply.Apply1<URI> = {
  URI,
  map: _map,
  ap: _ap,
};

export const Chain: Chain1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate,
};

// TODO Extend

export const Filterable: Filterable1<URI> = {
  URI,
  map: _map,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap,
  separate,
  compact,
};

export const Foldable: Foldable1<URI> = {
  URI,
  reduce: _reduce,
  reduceRight: _reduceRight,
  foldMap: _foldMap,
};

export const FromEither: FromEither1<URI> = {
  URI,
  fromEither,
};

export const Functor: Functor1<URI> = {
  URI,
  map: _map,
};

export const Monad: Monad1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};

// TODO MonadThrow

export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

export const Traversable: Traversable1<URI> = {
  URI,
  map: _map,
  traverse: _traverse,
  sequence,
  reduce: _reduce,
  reduceRight: _reduceRight,
  foldMap: _foldMap,
};

// TODO Witherable

export const Zero: Zero1<URI> = {
  URI,
  zero,
};

export const getEq = <A>(EA: Eq<A>): Eq<Remote<A>> => ({
  equals: (x, y) =>
    pipe(
      x,
      fold(
        () => isInitial(y),
        () => isPending(y),
        (ax) =>
          pipe(
            y,
            fold(constFalse, constFalse, (ay) => EA.equals(ax, ay)),
          ),
      ),
    ),
});

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

export const getShow = <A>(SA: Show<A>): Show<Remote<A>> => ({
  show: fold(
    () => 'initial',
    () => 'pending',
    (a) => `done(${SA.show(a)})`,
  ),
});

export const sequenceArray: <A>(rs: Array<Remote<A>>) => Remote<Array<A>> =
  array.sequence(Applicative);

export const sequenceS = apply.sequenceS(Apply);

export const sequenceT = apply.sequenceT(Apply);
