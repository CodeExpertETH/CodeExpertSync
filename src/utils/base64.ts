import { either, iots, pipe } from '../prelude';

export interface Base64Brand {
  readonly Base64: unique symbol;
}
export type Base64 = iots.Branded<string, Base64Brand>;
const Base64RegEx = /^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$/;
export const Base64 = iots.brand(iots.string, (s): s is Base64 => Base64RegEx.test(s), 'Base64');

export const Uint8ArrayToBase64 = new iots.Type<Uint8Array, Base64>(
  'Uint8ArrayToBase64',
  (u): u is Uint8Array => u instanceof Uint8Array,
  (input, context) =>
    pipe(
      Base64.validate(input, context),
      either.map((base64) => Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))),
    ),
  (uintA) => btoa(uintA.reduce((data, byte) => data + String.fromCharCode(byte), '')) as Base64,
);
