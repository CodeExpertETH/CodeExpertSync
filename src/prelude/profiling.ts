import { date, monadIO, pipeable } from 'fp-ts';
import { FunctionN, pipe } from 'fp-ts/function';
import { Kind, Kind2, URIS, URIS2 } from 'fp-ts/HKT';
import differenceInMilliseconds from 'date-fns/fp/differenceInMilliseconds';

type MeasureTime = {
  <F extends URIS2, E>(F: monadIO.MonadIO2<F>): <A>(fa: Kind2<F, E, A>) => Kind2<F, E, [A, number]>;
  <F extends URIS>(F: monadIO.MonadIO1<F>): <A>(fa: Kind<F, A>) => Kind<F, [A, number]>;
};

/**
 * Measure the time (in milliseconds) it takes to execute a task.
 */
export const measureTime: MeasureTime =
  <F extends URIS>(F: monadIO.MonadIO1<F>) =>
  <A>(fa: Kind<F, A>) => {
    const FS = pipeable.pipeable(F);
    return pipe(
      F.fromIO(date.create),
      FS.chain((start) =>
        pipe(
          fa,
          FS.chain<A, [A, number]>((a) =>
            pipe(
              F.fromIO(date.create),
              FS.map((end) => [a, pipe(end, differenceInMilliseconds(start))]),
            ),
          ),
        ),
      ),
    );
  };

type LogTime = {
  <F extends URIS2, E>(F: monadIO.MonadIO2<F>, log: FunctionN<[string], Kind2<F, E, void>>): <A>(
    fa: Kind2<F, E, A>,
    label: string,
  ) => Kind2<F, E, A>;
  <F extends URIS>(F: monadIO.MonadIO1<F>, log: FunctionN<[string], Kind<F, void>>): <A>(
    fa: Kind<F, A>,
    label: string,
  ) => Kind<F, A>;
};

/**
 * Measures and logs the time it takes to execute a task.
 */
export const logTime: LogTime =
  <F extends URIS>(F: monadIO.MonadIO1<F>, log: FunctionN<[string], Kind<F, void>>) =>
  <A>(fa: Kind<F, A>, label: string) => {
    const FS = pipeable.pipeable(F);
    return pipe(
      log(`Starting task "${label}"`),
      FS.chain(() => measureTime(F)(fa)),
      FS.chain(([a, m]) =>
        pipe(
          log(`Task "${label}" took ${m} ms`),
          FS.map(() => a),
        ),
      ),
    );
  };
