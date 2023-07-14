// import * as o from 'fp-ts/Option';
import * as oT from 'fp-ts/OptionT';
import * as remote from './remote';

export const URI = 'RemoteOption';
export type URI = typeof URI;

export const some = oT.some(remote.Monad);
