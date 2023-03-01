import { iots } from '../prelude';

const base64Regex = /^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$/;

export interface AccessTokenBrand {
  readonly AccessToken: unique symbol;
}

export const AccessToken = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AccessTokenBrand> => base64Regex.test(s),
  'AccessToken',
);

export type AccessToken = iots.TypeOf<typeof AccessToken>;
