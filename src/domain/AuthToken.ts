import { iots } from '@code-expert/prelude';

import { Base64Url } from '../utils/base64url';

export interface AccessTokenBrand {
  readonly AccessToken: unique symbol;
}

export const AccessToken = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AccessTokenBrand> => Base64Url.is(s),
  'AccessToken',
);

export type AccessToken = iots.TypeOf<typeof AccessToken>;
