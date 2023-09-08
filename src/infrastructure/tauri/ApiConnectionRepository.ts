import { atom, property } from '@frp-ts/core';

export type ApiConnection = 'connected' | 'disconnected';

export type ApiConnectionProperty = property.Property<ApiConnection>;
export type ApiConnectionAtom = atom.Atom<ApiConnection>;

export const mkApiConnectionAtom = () => atom.newAtom<ApiConnection>('disconnected');
