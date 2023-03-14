import { assert, describe, it } from 'vitest';

import {
  Identity,
  Kind,
  Kind2,
  URIS,
  URIS2,
  either,
  io,
  naturalTransformation as nt,
  pipe,
  taskEither,
} from './';

type TestService<F extends URIS> = {
  true(): Kind<F, boolean>;
  length(s: string): Kind<F, number>;
  repeat<A>(a: A, n: number): Kind<F, Array<A>>;
};

type TestService2<F extends URIS2, E> = {
  true(): Kind2<F, E, boolean>;
  length(s: string): Kind2<F, E, number>;
  repeat<A>(a: A, n: number): Kind2<F, E, Array<A>>;
};

declare module './naturalTransformation' {
  interface ServiceKind<F extends URIS> {
    TestService: TestService<F>;
  }
  interface ServiceKind2<F extends URIS2, E> {
    TestService: TestService2<F, E>;
  }
}

describe('transform', () => {
  it('should work correctly', async () => {
    const idService: TestService<Identity.URI> = {
      true: () => true,
      length: (s) => s.length,
      repeat: (a, n) => new Array(n).fill(a),
    };

    const ioService: TestService<io.URI> = nt.transform<'TestService', Identity.URI, io.URI>(
      idService,
      nt.idToIo,
    );
    assert.deepStrictEqual(true, ioService.true()());
    assert.deepStrictEqual(5, ioService.length('hello')());
    assert.deepStrictEqual(['a', 'a', 'a'], ioService.repeat('a', 3)());

    const teService: TestService2<taskEither.URI, never> = nt.transform<
      'TestService',
      io.URI,
      taskEither.URI,
      never
    >(ioService, taskEither.fromIO);

    const compareTE = async <A>(expected: A, actual: taskEither.TaskEither<never, A>) =>
      assert.deepStrictEqual(either.right(expected), await pipe(actual, taskEither.run));

    await compareTE(true, teService.true());
    await compareTE(5, teService.length('hello'));
    await compareTE(['a', 'a', 'a'], teService.repeat('a', 3));
  });
});
