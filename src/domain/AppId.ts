import { iots } from '../prelude';

export interface AppIdBrand {
  readonly AppId: unique symbol;
}

export const AppId = iots.brand(
  iots.string,
  (s): s is iots.Branded<string, AppIdBrand> => typeof s === 'string',
  'AppId',
);

export type AppId = iots.TypeOf<typeof AppId>;
