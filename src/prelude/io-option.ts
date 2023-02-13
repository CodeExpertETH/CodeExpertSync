import { Lazy } from 'fp-ts/function';
import { applicative, apply, io, ioOption, option } from 'fp-ts';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/lib/HKT';

export * from 'fp-ts/IOOption';

export const sequenceS = apply.sequenceS(ioOption.Apply);

/**
 * Create an optional value depending on whether a condition is fulfilled.
 */
export const fromBoolean =
  <A>(onTrue: Lazy<A>) =>
  (condition: boolean): ioOption.IOOption<A> =>
    condition ? ioOption.some(onTrue()) : ioOption.none;

export function traverseOption<F extends URIS2>(
  F: applicative.Applicative2<F>,
): <E, A, B>(
  f: (_: A) => Kind2<F, E, B>,
) => (_: ioOption.IOOption<A>) => io.IO<Kind2<F, E, option.Option<B>>>;
export function traverseOption<F extends URIS>(
  F: applicative.Applicative1<F>,
): <A, B>(
  f: (_: A) => Kind<F, B>,
) => (_: ioOption.IOOption<A>) => io.IO<Kind<F, option.Option<B>>> {
  return (f) => io.map(option.traverse(F)(f));
}
