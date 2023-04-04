import { iots } from '@code-expert/prelude';

import { Base64Url } from '../utils/base64url';

export interface ClientIdBrand {
  readonly ClientId: unique symbol;
}

export const ClientId = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, ClientIdBrand> => Base64Url.is(s),
  'ClientId',
);

export type ClientId = iots.TypeOf<typeof ClientId>;
