import { either, iots, pipe } from '@code-expert/prelude';
import base64url from 'base64url';
import { Buffer } from 'buffer';

export interface Base64UrlBrand {
  readonly Base64Url: unique symbol;
}
export type Base64Url = iots.Branded<string, Base64UrlBrand>;
const Base64UrlRegEx = /^[A-Za-z0-9_-]+$/;
export const Base64Url = iots.brand(
  iots.string,
  (s): s is Base64Url => Base64UrlRegEx.test(s),
  'Base64Url',
);

export const Uint8ArrayToBase64Url = new iots.Type<Uint8Array, Base64Url>(
  'Uint8ArrayToBase64Url',
  (u): u is Uint8Array => u instanceof Uint8Array,
  (input, context) =>
    pipe(
      Base64Url.validate(input, context),
      either.map((base64Url) =>
        Uint8Array.from(Buffer.from(base64url.toBase64(base64Url), 'base64')),
      ),
    ),
  (uintA) => base64url.fromBase64(Buffer.from(uintA).toString('base64')) as Base64Url,
);
