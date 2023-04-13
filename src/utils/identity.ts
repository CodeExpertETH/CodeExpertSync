import { iots, string } from '@code-expert/prelude';

declare const _entityIdBrand: unique symbol;

export interface EntityIdBrand<B extends symbol> {
  readonly [_entityIdBrand]: B;
}

export type EntityId<A extends symbol> = string & EntityIdBrand<A>;

export type EntityIdC<B extends symbol> = iots.Type<EntityId<B>, string>;

const EntityIdRegExp = /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/;

export const isEntityId = (u: unknown): boolean => string.isString(u) && EntityIdRegExp.test(u);

/**
 * Creates a branded EntityId codec that respects Meteor's rules for Mongo document IDs and
 * produces nominal ID types that can't be accidentally mixed up with each other.
 */
export const mkEntityIdCodec = <S extends symbol>(sym: S): EntityIdC<S> => {
  const is = (u: unknown): u is EntityId<S> => isEntityId(u);
  return new iots.Type(
    sym.description ?? sym.toString(),
    is,
    (u, c) => (is(u) ? iots.success(u) : iots.failure(u, c)),
    String,
  );
};
