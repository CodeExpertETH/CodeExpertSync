import { Has, IsExact, IsNever, NotHas, assert } from 'conditional-type-checks';
import { describe, expect, it } from 'vitest';

import { DistributiveKeyof, DistributivePick, PathOf, PickPath } from './type-utils';

// -------------------------------------------------------------------------------------------------
// DistributivePick
// -------------------------------------------------------------------------------------------------

type EntityA = {
  type: 'a';
  a: string;
  b: boolean;
};
type EntityB = {
  type: 'b';
  a: string;
  c?: number;
};
type Entity = EntityA | EntityB;

// @ts-expect-error must not accept a nonexistent key
assert<IsNever<DistributivePick<Entity, 'nonexistent key'>>>(true);

// must play nicely with Distributive Keyof
assert<IsExact<DistributivePick<Entity, DistributiveKeyof<Entity>>, Entity>>(true);
assert<Has<DistributivePick<Entity, DistributiveKeyof<Entity>>, EntityA>>(true);
assert<Has<DistributivePick<Entity, DistributiveKeyof<Entity>>, EntityB>>(true);

// full types must not be in result
assert<NotHas<DistributivePick<Entity, 'a' | 'b'>, EntityA>>(true);
assert<NotHas<DistributivePick<Entity, 'a' | 'b'>, EntityB>>(true);

// partial types must be in result
assert<Has<DistributivePick<Entity, 'a' | 'b'>, Pick<EntityA, 'a' | 'b'>>>(true);
assert<Has<DistributivePick<Entity, 'a' | 'b'>, Pick<EntityB, 'a'>>>(true);

// members without matching fields must not be in result
assert<IsExact<DistributivePick<Entity, 'b'>, Pick<EntityA, 'b'>>>(true);

// -------------------------------------------------------------------------------------------------
// PathOf
// -------------------------------------------------------------------------------------------------

interface EntityC {
  a: number;
  b?: string | null;
  c: {
    d: boolean;
    e: Record<string, string>;
    f: Record<'g' | 'h', string>;
    i: {
      j: number;
    };
  };
  k?: {
    l: string;
    m: number;
  };
}

assert<
  IsExact<
    PathOf<EntityC>,
    | 'a'
    | 'b'
    | 'c'
    | `c.${'d' | 'e' | `e.${string}` | 'f' | `f.${'g' | 'h'}` | 'i' | `i.j`}`
    | 'k'
    | 'k.l'
    | 'k.m'
  >
>(true);

assert<Has<PathOf<EntityC>, 'bogus'>>(false);

// -------------------------------------------------------------------------------------------------
// PickPath
// -------------------------------------------------------------------------------------------------

// @ts-expect-error must not accept invalid paths
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InvalidPathPick = PickPath<EntityC, 'c.nonexistent.key'>;

// must correctly refine records
assert<IsExact<PickPath<Record<string, string>, 'any key'>, Record<'any key', string>>>(true);

// must play nicely with PathOf
assert<IsExact<PickPath<EntityC, PathOf<EntityC>>, EntityC>>(true);

// must correctly extract complex subtypes
assert<
  IsExact<
    PickPath<EntityC, 'a' | 'c.d' | 'c.f.g'>,
    {
      a: number;
      c: {
        d: boolean;
        f: {
          g: string;
        };
      };
    }
  >
>(true);

// optional props must remain optional
assert<Has<PickPath<EntityC, 'k.m'>['k'], undefined>>(true);

// optional props must be picked correctly
assert<IsExact<NonNullable<PickPath<EntityC, 'k.m'>['k']>, { m: number }>>(true);

// complete alternative test for optional props
assert<IsExact<PickPath<EntityC, 'k.m'>, { k?: { m: number } }>>(true);

describe('type-tests', () => {
  it('should run at compile time', () => {
    expect(true).toBe(true);
  });
});
