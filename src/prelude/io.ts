import { apply, io } from 'fp-ts';

import * as functor from './functor';

export * from 'fp-ts/IO';

export const run = <A>(i: io.IO<A>) => i();

export const sequenceT = apply.sequenceT(io.Apply);

export const toVoid = functor.toVoid(io.Functor);
