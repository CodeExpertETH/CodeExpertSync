import * as array from 'fp-ts/Array';
import type { Option } from 'fp-ts/Option';
import * as option from 'fp-ts/Option';
import { Predicate } from 'fp-ts/Predicate';
import type { Tree } from 'fp-ts/Tree';
import * as tree from 'fp-ts/Tree';
import { flow, pipe } from 'fp-ts/function';

export * from 'fp-ts/Tree';

export const toArray = <A>(ta: Tree<A>): Array<A> =>
  pipe(ta, tree.foldMap(array.getMonoid<A>())(array.of));

/**
 * Filter each node of a tree with a predicate. If the predicate does not hold, remove that node
 * and all its child nodes.
 *
 * Because we don't have the concept of an empty tree, we return a None should all nodes be
 * filtered out by the predicate.
 */
export const filter: <A>(predicate: Predicate<A>) => (ta: Tree<A>) => Option<Tree<A>> = (
  predicate,
) =>
  flow(
    option.fromPredicate(({ value }) => predicate(value)),
    option.map(({ value, forest }) =>
      tree.make(value, pipe(forest, array.filterMap(filter(predicate)))),
    ),
  );
