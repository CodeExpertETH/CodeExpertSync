import { iots } from '../prelude';
import { Base64 } from '../utils/base64';

export interface AppIdBrand {
  readonly AppId: unique symbol;
}

export const AppId = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AppIdBrand> => Base64.is(s),
  'AppId',
);

export type AppId = iots.TypeOf<typeof AppId>;
