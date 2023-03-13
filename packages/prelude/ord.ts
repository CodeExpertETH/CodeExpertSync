import * as monoid from 'fp-ts/Monoid';
import { NonEmptyArray } from 'fp-ts/NonEmptyArray';
import * as O from 'fp-ts/Ord';

export * from 'fp-ts/Ord';

export const getNullable = <T>(
  ord: O.Ord<NonNullable<T>>,
): O.Ord<NonNullable<T> | null | undefined> =>
  O.fromCompare((a, b) => {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    return ord.compare(a, b);
  });

/**
 * Returns and ord that uses the Ords it's been given in that priority.
 *
 * @see Ord.getMonoid
 * @example
 * interface User {
 *   readonly id: number;
 *   readonly name: string;
 *   readonly age: number;
 *   readonly rememberMe: boolean;
 * }
 *
 * const byName = ord.contramap((p: User) => p.name)(string.Ord);
 *
 * const byAge = ord.contramap((p: User) => p.age)(number.Ord);
 *
 * const byRememberMe = ord.contramap((p: User) => p.rememberMe)(boolean.Ord);
 *
 * const users: Array<User> = [
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 * ];
 *
 * // sort by name, then by age, then by `rememberMe`
 * assert.deepStrictEqual(pipe(users, array.sort(ord.concatAll(byName, byAge, byRememberMe))), [
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
 * ]);
 *
 * // now `rememberMe = true` first, then by name, then by age
 * assert.deepStrictEqual(pipe(users, array.sort(ord.concatAll(byRememberMe, byName, byAge))), [
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
 * ]);
 */
export const concatAll = <T>(...ords: NonEmptyArray<O.Ord<T>>) =>
  monoid.concatAll(O.getMonoid<T>())(ords);
