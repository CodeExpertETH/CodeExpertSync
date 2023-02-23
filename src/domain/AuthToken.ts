import { iots } from '../prelude';

const base64Regex = /^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$/;

export interface AuthTokenBrand {
  readonly AuthToken: unique symbol;
}

export const AuthToken = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AuthTokenBrand> => base64Regex.test(s),
  'AuthToken',
);

export type AuthToken = iots.TypeOf<typeof AuthToken>;
