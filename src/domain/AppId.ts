import { iots } from '@code-expert/prelude';

import { Base64Url } from '../utils/base64url';

export interface AppIdBrand {
  readonly AppId: unique symbol;
}

export const AppId = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AppIdBrand> => Base64Url.is(s),
  'AppId',
);

export type AppId = iots.TypeOf<typeof AppId>;
