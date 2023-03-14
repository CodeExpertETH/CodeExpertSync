import { $IntentionalAny, $Unexpressable } from '@code-expert/type-utils';
import { identity, io, naturalTransformation as nt, record } from 'fp-ts';
import { URIS, URIS2 } from 'fp-ts/HKT';
import { flow, pipe } from 'fp-ts/function';

export * from 'fp-ts/NaturalTransformation';

export interface ServiceKind<F extends URIS> {
  _F: F;
}

export interface ServiceKind2<F extends URIS2, E> {
  _F: F;
  _E: E;
}

type Services = keyof ServiceKind<URIS>;
type Services2 = keyof ServiceKind2<URIS2, unknown>;

export type Transform = {
  <S extends Services, F extends URIS, G extends URIS>(
    sf: ServiceKind<F>[S],
    t: nt.NaturalTransformation11<F, G>,
  ): ServiceKind<G>[S];
  <S extends Services & Services2, F extends URIS, G extends URIS2, E>(
    sf: ServiceKind<F>[S],
    t: nt.NaturalTransformation12<F, G>,
  ): ServiceKind2<G, E>[S];
};

/**
 * Transforms a service to a different target type using a natural transformation.
 *
 * Some problems and thoughts:
 * - It was possible to type it as `transform<io.URI, ServiceA<io.URI>, task.URI, ServiceB<io.URI>>`
 * - A helper type `Transform<ServiceA<io.URI>, io.URI, task.URI> === ServiceA<task.URI>` that can
 *   handle generic methods is impossible, because of a lack of HKTs in TS.
 * - Services over Monads with multiple type parameters might be more usable if the additional
 *   params would be scoped per method.
 */
export const transform: Transform = <S extends Services, F extends URIS, G extends URIS>(
  service: ServiceKind<F>[S],
  t: nt.NaturalTransformation11<F, G>,
) =>
  pipe(
    service,
    record.map((f) => flow(f as $Unexpressable, t)) as $Unexpressable,
  ) as $IntentionalAny;

/**
 * Natural transformation from Identity to IO.
 */
export const idToIo: nt.NaturalTransformation11<identity.URI, io.URI> = io.of;
