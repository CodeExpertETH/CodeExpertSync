import { $Unexpressable } from '@code-expert/type-utils';
import { monoid, option } from 'fp-ts';
import * as either from 'fp-ts/Either';
import { Refinement } from 'fp-ts/Refinement';
import { flow } from 'fp-ts/function';
import * as t from 'io-ts';
import { formatValidationErrors } from 'io-ts-reporters';
import * as string from './string';

export * from 'io-ts';
export {
  date,
  DateFromISOString,
  fromNewtype,
  nonEmptyArray,
  withFallback,
  withMessage,
  withValidate,
  NumberFromString,
} from 'io-ts-types';
export { formatValidationErrors } from 'io-ts-reporters';

// -------------------------------------------------------------------------------------------------

export interface NonBlankStringBrand {
  readonly NonBlankString: unique symbol;
}

export type NonBlankString = t.Branded<string, NonBlankStringBrand>;

export const nonBlankString = t.brand(
  t.string,
  (s): s is NonBlankString => string.isNotBlank(s),
  'NonBlankString',
);

// -------------------------------------------------------------------------------------------------

export interface URLBrand {
  readonly URL: unique symbol;
}

export type URL = t.Branded<string, URLBrand>;

export const URL = t.brand(
  t.string,
  (s): s is URL => {
    try {
      new global.URL(s);
      return true;
    } catch {
      return false;
    }
  },
  'URL',
);

// -------------------------------------------------------------------------------------------------

/**
 * Parse a value, returning either an array of error messages or the parsed value.
 */
export const parseEither = <I, A>(
  decoder: t.Decoder<I, A>,
): ((i: I) => either.Either<Array<string>, A>) =>
  flow(decoder.decode, either.mapLeft(formatValidationErrors));

/**
 * Parse a value, returning an optional value.
 */
export const parseOption = <I, A>(decoder: t.Decoder<I, A>): ((i: I) => option.Option<A>) =>
  flow(decoder.decode, option.fromEither);

/**
 * Parse a value or fail by throwing a TypeError.
 */
export const parseSync = <I, A>(decoder: t.Decoder<I, A>): ((i: I) => A) =>
  flow(
    parseEither(decoder),
    either.mapLeft(monoid.concatAll(string.semicolonSeparated)),
    either.getOrElseW((err) => {
      throw new TypeError(err);
    }),
  );

// -------------------------------------------------------------------------------------------------

const prefixedString = (prefix: string) =>
  new t.Type<string, string, unknown>(
    'Prefixed',
    (i): i is string => typeof i === 'string' && i.startsWith(prefix),
    (i, context) =>
      typeof i === 'string' && i.startsWith(prefix)
        ? t.success(i.substring(prefix.length))
        : t.failure(i, context, `Invalid input`),
    (s) => `${prefix}${s}`,
  );

/**
 * Transform a string-based codec by prepending the encoded values with the name of the codec.
 * Useful for discriminating between encoded values of different codecs.
 */
export const prefixed = <A>(codec: t.Type<A, string>): t.Type<A, string> =>
  prefixedString(`${codec.name}-`).pipe(codec);

export const Uint8ArrayC = new t.Type<Uint8Array, Array<number>>(
  'Uint8Array',
  (u): u is Uint8Array => u instanceof globalThis.Uint8Array,
  (input, context) =>
    input instanceof globalThis.Uint8Array
      ? either.right(input)
      : Array.isArray(input)
      ? either.tryCatch(
          () => new Uint8Array(input),
          (): Array<t.ValidationError> => [
            {
              value: input,
              context,
              message: `Failed to construct Uint8Array from Array`,
            },
          ],
        )
      : typeof input === 'string'
      ? either.right(new Uint8Array(new TextEncoder().encode(input)))
      : t.failure(input, context, 'Expecting either Uint8Array, Array, or string'),
  (a) => Array.from(a),
);

type TaggedC<T extends string, C extends t.Mixed> = C extends t.UndefinedC
  ? t.ExactC<t.TypeC<{ _tag: t.LiteralType<T> }>>
  : t.ExactC<t.TypeC<{ _tag: t.LiteralType<T>; value: C }>>;

export const tagged = <T extends string, C extends t.Mixed = t.UndefinedC>(
  tag: T,
  codec?: C,
): TaggedC<T, C> =>
  codec == null
    ? t.strict({ _tag: t.literal(tag) })
    : (t.strict({ _tag: t.literal(tag), value: codec }) as $Unexpressable);

/**
 * Creates a branded value from a literal using a type assertion.
 * Caution: The input is not validated; use this function only when it is guaranteed that the
 * input represents a valid value.
 */
export function brandFromLiteral<A, B>(literal: A): t.Branded<A, B> {
  return literal as t.Branded<A, B>;
}

/**
 * Drops the brand information from a literal.
 */
export const literalFromBrand = <A, B>(branded: t.Branded<A, B>): A => branded;

export const unsafeDecode =
  (toThrowable: (e: Array<string>) => Error) =>
  <A, B>(decoder: t.Decoder<A, B>) =>
    flow(
      decoder.decode,
      either.mapLeft(formatValidationErrors),
      either.fold(
        (err) => {
          throw toThrowable(err);
        },
        (a) => a,
      ),
    );

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BrandIdentityC<C extends t.Any, B>
  extends t.RefinementType<C, t.Branded<t.TypeOf<C>, B>, t.Branded<t.TypeOf<C>, B>, t.InputOf<C>> {}

export const brandIdentity: <
  C extends t.Any,
  N extends string,
  B extends { readonly [K in N]: symbol },
>(
  codec: C,
  predicate: Refinement<t.TypeOf<C>, t.Branded<t.TypeOf<C>, B>>,
  name: N,
) => BrandIdentityC<C, B> = t.brand;

/**
 * Pipeable alternative for iots.Type.validate.
 */
export const validate =
  <I, A>(codec: t.Decoder<I, A>, c: t.Context) =>
  (i: I): t.Validation<A> =>
    codec.validate(i, c);
