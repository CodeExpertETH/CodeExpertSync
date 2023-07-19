import * as array from 'fp-ts/Array';
import * as tree from 'fp-ts/Tree';
import { pipe } from 'fp-ts/function';

export * from 'fp-ts/Tree';

export const toArray = <A>(ta: tree.Tree<A>): Array<A> =>
  pipe(ta, tree.foldMap(array.getMonoid<A>())(array.of));
