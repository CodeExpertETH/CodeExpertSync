import { either, option, pipe } from "../../prelude";

export * as fc from "./fast-check";
export * as arbitrary from "./arbitrary";
export * as laws from "./laws";

/**
 * Fold over Options nested within Eithers.
 *
 * @param outer The Either that wraps a value containing an Option
 * @param getLeftInner Extract the Option from the Either’s left
 * @param getRightInner Extract the Option from the Either’s right
 * @param matrix A fold over the four possible combinations
 */
export const eitherOptionMatrix = <L, R, A, B>(
  outer: either.Either<L, R>,
  getLeftInner: (l: L) => option.Option<A>,
  getRightInner: (r: R) => option.Option<A>,
  matrix: {
    leftNone: (l: L) => B;
    leftSome: (l: L, s: A) => B;
    rightNone: (r: R) => B;
    rightSome: (r: R, s: A) => B;
  }
) =>
  pipe(
    outer,
    either.fold(
      (l) =>
        pipe(
          getLeftInner(l),
          option.fold(
            () => matrix.leftNone(l),
            (s) => matrix.leftSome(l, s)
          )
        ),
      (r) =>
        pipe(
          getRightInner(r),
          option.fold(
            () => matrix.rightNone(r),
            (s) => matrix.rightSome(r, s)
          )
        )
    )
  );

/**
 * Print the JSON representation of an object to the console and return it. Useful for pipes.
 *
 * @example
 * pipe(
 *   ...,
 *   log,
 *   ...,
 * )
 */
export const log = <A>(a: A): A => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(a));
  return a;
};
