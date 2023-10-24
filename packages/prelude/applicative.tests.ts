import { applicative, array, either } from 'fp-ts';
import { identity, pipe } from 'fp-ts/function';
import { assert, it } from 'vitest';

it('', () => {
  const numbers = [0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 16];
  const visited: Array<number> = [];

  type ValidateEven<E> = (n: number) => either.Either<E, number>;

  const validateEven = <E>(onError: (_: number) => E): ValidateEven<E> =>
    either.fromPredicate((n) => {
      visited.push(n);
      return n % 2 === 0;
    }, onError);

  const validateEvenSingle: ValidateEven<number> = validateEven(identity);
  const validateEvenArray: ValidateEven<Array<number>> = validateEven(array.of);

  // array.traverse(either.Applicative) returns the first failure and visits all elements
  {
    const result = pipe(numbers, array.traverse(either.Applicative)(validateEvenSingle));
    assert.deepStrictEqual(result, either.left(7));
    assert.deepEqual(visited, [0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 16]);
    visited.splice(0, visited.length);
  }

  // either.traverseArray returns the first failure and doesn't visit the remaining elements
  {
    const result = pipe(numbers, either.traverseArray(validateEvenSingle));
    assert.deepStrictEqual(result, either.left(7));
    assert.deepEqual(visited, [0, 2, 4, 6, 7]);
    visited.splice(0, visited.length);
  }

  // array.traverse(either.getApplicativeValidation(…)) collects all failures
  {
    const collectErrors: applicative.Applicative2C<either.URI, number[]> =
      either.getApplicativeValidation(array.getSemigroup<number>());

    const result = pipe(numbers, array.traverse(collectErrors)(validateEvenArray));
    assert.deepStrictEqual(result, either.left([7, 13]));
    assert.deepEqual(visited, [0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 16]);
    visited.splice(0, visited.length);
  }
});
