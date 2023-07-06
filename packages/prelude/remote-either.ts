import { remote, remoteEither } from '@code-expert/remote-ts';
import { $IntentionalAny } from '@code-expert/type-utils';
import * as eT from './eithert';

module.exports = remoteEither;

export declare const foo: $IntentionalAny;

export const fromOption = eT.fromOptionF(remote.Functor);
