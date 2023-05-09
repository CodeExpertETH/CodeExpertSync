import { assert, describe, it } from 'vitest';
import { either, iots, monoid, pipe, string } from '@code-expert/prelude';
import { ValidationException } from '@/domain/exception';

describe('ValidationException', () => {
  it('should emit validation errors', () => {
    const codec = iots.strict({
      a: iots.string,
      b: iots.strict({
        n: iots.number,
      }),
    });

    const invalid = { a: 1, b: { n: 'hello' } };

    const expectedErrors = pipe(
      [
        'Expecting string at a but instead got: 1',
        'Expecting number at b.n but instead got: "hello"',
      ],
      monoid.concatAll(string.semicolonSeparated),
    );

    pipe(
      codec.decode(invalid),
      either.mapLeft((errors) => new ValidationException(iots.formatValidationErrors(errors))),
      either.fold(
        (e) => {
          if (e instanceof ValidationException) {
            assert.equal(String(e), `Error: Validation failed: ${expectedErrors}`);
          } else {
            assert.fail(`expected ValidationException`);
          }
        },
        () => {
          assert.fail('expected result to be Either.Left');
        },
      ),
    );
  });
});
