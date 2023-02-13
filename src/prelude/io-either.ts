import * as Ap from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as IO from 'fp-ts/IO';
import * as IOe from 'fp-ts/IOEither';
import * as IOo from 'fp-ts/IOOption';
import { constFalse, constTrue, flow, Lazy, pipe } from 'fp-ts/function';

export * from 'fp-ts/IOEither';

export const fromNullable: <E>(e: Lazy<E>) => <A>(la: A) => IOe.IOEither<E, NonNullable<A>> =
  (e) => (la) => () =>
    E.fromNullable(e())(la);

export const fromIOOption: <E>(
  onNone: Lazy<E>,
) => <A>(fa: IOo.IOOption<A>) => IOe.IOEither<E, A> = (onNone) => IO.map(E.fromOption(onNone));

export const run = <E, A>(i: IOe.IOEither<E, A>): E.Either<E, A> => i();

export const runUnion: <E, A, B>(
  f: (e: E) => B,
  g: (a: A) => B,
) => (fa: IOe.IOEither<E, A>) => B = (f, g) => flow(IOe.bimap(f, g), IOe.toUnion, (t) => t());

export const sequenceS = Ap.sequenceS(IOe.ApplicativePar);

export const getOrThrow =
  <E>(toThrowable: (e: E) => Error) =>
  <A>(fa: IOe.IOEither<E, A>): A =>
    pipe(
      run(fa),
      E.getOrElse<E, A>((e) => {
        throw toThrowable(e);
      }),
    );

export const exists: <E, A>(f: (a: A) => boolean) => (fa: IOe.IOEither<E, A>) => boolean = (f) =>
  runUnion(constFalse, f);

export const isLeft: <E, A>(fa: IOe.IOEither<E, A>) => boolean = runUnion(constTrue, constFalse);

export const isRight: <E, A>(fa: IOe.IOEither<E, A>) => boolean = runUnion(constFalse, constTrue);

export const tapLeft: <E, A>(
  f: (e: E) => void,
) => (fa: IOe.IOEither<E, A>) => IOe.IOEither<E, A> = (f) =>
  IOe.mapLeft((x) => {
    f(x);
    return x;
  });
