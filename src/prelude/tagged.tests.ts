/* eslint-disable no-lone-blocks */
import { assert as Assert, IsExact } from 'conditional-type-checks';
import { option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { assert, describe, it } from 'vitest';

import { tagged } from '../prelude';

describe('prelude/tagged', () => {
  type Num = tagged.Tagged<'num', number>;

  type Str = tagged.Tagged<'str', 'hello' | 'world'>;

  type Nvr = tagged.Tagged<'nvr'>;

  type Types = Num | Str | Nvr;

  const adt = tagged.build<Types>();

  describe('constructors', () => {
    it('should build correct objects', () => {
      assert.deepEqual(adt.num(1), { _tag: 'num', value: 1 });
      assert.deepEqual(adt.str('hello'), { _tag: 'str', value: 'hello' });
      assert.deepEqual(adt.nvr(), { _tag: 'nvr' });
    });

    it('should statically reject unknown tags', () => {
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.bogus();
    });
  });

  describe('wide constructors', () => {
    it('should build correct objects', () => {
      assert.deepEqual(adt.wide.num(1), { _tag: 'num', value: 1 });
      assert.deepEqual(adt.wide.str('hello'), { _tag: 'str', value: 'hello' });
      assert.deepEqual(adt.wide.nvr(), { _tag: 'nvr' });
    });

    it('should statically reject unknown tags', () => {
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.wide.bogus();
    });

    it('should not return narrowed types', () => {
      pipe(option.some('hello' as const), option.fold(adt.wide.nvr, adt.wide.str));
    });
  });

  describe('fold', () => {
    const testDataFirst = (a: Types) =>
      adt.fold(a, {
        num: (n) => n + 1,
        str: (s) => s.length,
        nvr: () => 42,
      });
    it('should accept data first', () => {
      assert.equal(testDataFirst(adt.num(1)), 2);
      assert.equal(testDataFirst(adt.str('hello')), 5);
      assert.equal(testDataFirst(adt.nvr()), 42);
    });
    const testDataLast = adt.fold({
      num: (n) => n + 1,
      str: (s) => s.length,
      nvr: () => 42,
    });
    it('should accept data last', () => {
      assert.equal(testDataLast(adt.num(1)), 2);
      assert.equal(testDataLast(adt.str('hello')), 5);
      assert.equal(testDataLast(adt.nvr()), 42);
    });
  });

  describe('is', () => {
    it('should correctly identify types', () => {
      assert.isTrue(adt.is.num(adt.num(1)));
      assert.isTrue(adt.is.str(adt.str('hello')));
      assert.isTrue(adt.is.nvr(adt.nvr()));
    });

    it('should accept other union members, but return false', () => {
      assert.isFalse(adt.is.num(adt.str('hello')));
      assert.isFalse(adt.is.str(adt.num(1)));
    });

    it('should statically reject non-union-members', () => {
      type Bogus = tagged.Tagged<'bogus'>;
      const bogus: Bogus = { _tag: 'bogus' };
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.is.num(bogus);
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.is.bogus(bogus);
    });

    it('should statically reject unknown tags', () => {
      const bogus = { _tag: 'bogus' };
      const num = adt.num(1);
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.is.bogus(bogus);
      // @ts-expect-error adt doesn't know tag 'bogus'
      adt.is.bogus(num);
    });

    it('should have stable references', () => {
      assert.strictEqual(adt.is.num, adt.is.num);
    });
  });
});

{
  /** Type checks for general structure */
  type Str = tagged.Tagged<'string', string>;
  type None = tagged.Tagged<'none'>;

  Assert<IsExact<Str, { _tag: 'string'; value: string }>>(true);

  Assert<IsExact<None, { _tag: 'none' }>>(true);
}

{
  /** Type checks for constructors */
  type Str = tagged.Tagged<'string', string>;
  type None = tagged.Tagged<'none'>;
  type StrOption = Str | None;

  // @ts-expect-error should not accept bogus tags
  tagged.build<StrOption>({ string: null, none: null, bogus: null });

  // @ts-expect-error should not accept bogus tags
  tagged.tag<Str>('bogus');

  // @ts-expect-error should not accept less than all tags
  tagged.build<StrOption>({ string: null });

  // should accept literal unions as value
  type TaggedLiteral = tagged.Tagged<'literal', 'a' | 'b'>;
  tagged.tag<TaggedLiteral>('literal')('a');
}

{
  /** Type checks for fold */
  type Str = tagged.Tagged<'string', string>;
  type None = tagged.Tagged<'none'>;
  type StringOption = Str | None;

  const foldStringOption = tagged.fold<StringOption>();

  foldStringOption({
    string: () => null,
    // @ts-expect-error valueless tagged types must not accept a value
    none: (foo: null) => foo,
  });

  foldStringOption({
    string: () => null,
    none: () => null,
    // @ts-expect-error should not accept bogus tags
    bogus: () => null,
  });

  // @ts-expect-error should not accept less than all tags
  foldStringOption({
    string: () => null,
  });
}
