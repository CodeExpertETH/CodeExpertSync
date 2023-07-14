import { remote, remoteEither } from '@code-expert/fp-ts-remote';
import * as eT from './eithert';

module.exports = remoteEither;

export const fromOption = eT.fromOptionF(remote.Functor);
