import { option } from 'fp-ts';
import { constFalse, constTrue, pipe } from 'fp-ts/function';
import { assert, describe, it } from 'vitest';
import { drawTree, filter, make, toArray } from './tree';

describe('tree', () => {
  const exampleTree = make('T', [make('T.1', [make('T.1.a')]), make('T.2')]);

  describe('toArray', () => {
    it('should render a tree’s elements to a flat array', () => {
      assert.deepEqual(pipe(exampleTree, toArray), ['T', 'T.1', 'T.1.a', 'T.2']);
    });
  });

  describe('filter', () => {
    it('should return the original tree if no filter applies', () => {
      assert.deepEqual(
        pipe(exampleTree, filter(constTrue), option.map(drawTree)),
        option.some(
          `
T
├─ T.1
│  └─ T.1.a
└─ T.2
`.trim(),
        ),
      );
    });

    it('should not return a tree if no value matches', () => {
      assert.deepEqual(pipe(exampleTree, filter(constFalse)), option.none);
    });

    it('should not return a tree if the root is filtered out', () => {
      const predicate = (a: string) => a !== 'T';
      assert.deepEqual(pipe(exampleTree, filter(predicate)), option.none);
    });

    it('should not return a tree if the root does not match', () => {
      const predicate = (a: string) => a === 'T.1';
      assert.deepEqual(pipe(exampleTree, filter(predicate)), option.none);
    });

    it('should only keep the root node if we filter for that', () => {
      const predicate = (a: string) => a === 'T';
      assert.deepEqual(
        pipe(exampleTree, filter(predicate), option.map(drawTree)),
        option.some('T'),
      );
    });

    it('should filter out branches that don’t match the predicate', () => {
      const predicate = (a: string) => a !== 'T.1';
      assert.deepEqual(
        pipe(exampleTree, filter(predicate), option.map(drawTree)),
        option.some(
          `
T
└─ T.2
`.trim(),
        ),
      );
    });
  });
});
