import { option } from 'fp-ts';
import { Lazy } from 'fp-ts/function';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import { MonadThrow1, MonadThrow2 } from 'fp-ts/MonadThrow';
import { Predicate } from 'fp-ts/Predicate';


export function fromOption<F extends URIS2>(
  M: MonadThrow2<F>,
): <E>(e: Lazy<E>) => <A>(o: option.Option<A>) => Kind2<F, E, A>;
export function fromOption<F extends URIS>(
  M: MonadThrow1<F>,
): <E>(e: Lazy<E>) => <A>(o: option.Option<A>) => Kind<F, A>;
export function fromOption<F extends URIS>(
  M: MonadThrow1<F>,
): <E>(e: Lazy<E>) => <A>(o: option.Option<A>) => Kind<F, A> {
  return (e) => option.fold(() => M.throwError(e()), M.of);
}

export function fromPredicate<F extends URIS2>(
  M: MonadThrow2<F>,
): <E, A>(f: Predicate<A>, e: Lazy<E>) => (a: A) => Kind2<F, E, A> {
  return (f, e) => (a) => f(a) ? M.of(a) : M.throwError(e());
}

export function fromNullable<F extends URIS2>(
  M: MonadThrow2<F>,
): <E>(e: Lazy<E>) => <A>(a: A) => Kind2<F, E, NonNullable<A>> {
  return <E>(e: Lazy<E>) =>
    <A>(a: A) =>
      a != null ? M.of(a as NonNullable<A>) : M.throwError(e());
}

export function assert<F extends URIS2>(
  M: MonadThrow2<F>,
): <E>(e: Lazy<E>) => (condition: boolean) => Kind2<F, E, void> {
  return <E>(e: Lazy<E>) =>
    (condition: boolean) =>
      condition ? M.of<E, void>(undefined) : M.throwError(e());
}
