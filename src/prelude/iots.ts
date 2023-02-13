import * as t from 'io-ts';
import { flow } from 'fp-ts/function';
import { fold, mapLeft } from 'fp-ts/Either';
import { formatValidationErrors } from 'io-ts-reporters';
import * as string from './string';

export * from 'io-ts';
export * from 'io-ts/Reporter';
export {
  date,
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
      mapLeft(formatValidationErrors),
      fold(
        (err) => {
          throw toThrowable(err);
        },
        (a) => a,
      ),
    );
