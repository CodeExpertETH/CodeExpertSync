import * as http from '@tauri-apps/api/http';
import { either, flow, iots } from '@code-expert/prelude';
import { HttpError, httpError } from './HttpError';

function mkResponseCodec<E, A>({
  valueCodec,
  errorCodec,
}: {
  valueCodec: iots.Type<A, unknown>;
  errorCodec: iots.Type<E, unknown>;
}) {
  return iots.union([
    iots.strict({
      ok: iots.literal(true),
      data: valueCodec,
    }),
    iots.strict({
      ok: iots.literal(false),
      data: errorCodec,
    }),
  ]);
}

export const parseResponse: <E, A>(codecs: {
  valueCodec: iots.Type<A, unknown>;
  errorCodec: iots.Type<E, unknown>;
}) => (r: http.Response<unknown>) => either.Either<HttpError, either.Either<E, A>> = (codecs) =>
  flow(
    mkResponseCodec(codecs).decode,
    either.bimap(flow(iots.formatValidationErrors, httpError.unknownBodyType), (res) =>
      res.ok ? either.right(res.data) : either.left(res.data),
    ),
  );
