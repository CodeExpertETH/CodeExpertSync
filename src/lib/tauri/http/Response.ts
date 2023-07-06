import * as http from '@tauri-apps/api/http';
import { either, flow, iots } from '@code-expert/prelude';
import { HttpError, httpError } from './HttpError';

const ResponseError = iots.strict({
  statusCode: iots.number,
  error: iots.string,
  message: iots.string,
});
type ResponseError = iots.TypeOf<typeof ResponseError>;

const Response = iots.union([
  iots.strict({
    ok: iots.literal(true),
    data: iots.unknown,
  }),
  iots.strict({
    ok: iots.literal(false),
    data: ResponseError,
  }),
]);

export const parseResponse: <A>(
  codec: iots.Decoder<unknown, A>,
) => (r: http.Response<unknown>) => either.Either<HttpError, A> = (codec) =>
  flow(
    Response.decode,
    either.mapLeft(iots.formatValidationErrors),
    either.getOrThrow(
      (errs) =>
        new Error(`Fetch response did not match Tauri’s "Response" type': ${errs.join('; ')}`),
    ),
    (res) => (res.ok ? either.right(res.data) : either.left(toHttpError(res.data))),
    either.map(
      flow(
        codec.decode,
        either.mapLeft(iots.formatValidationErrors),
        either.getOrThrow(
          (errs) => new Error(`Response payload did not match codec: ${errs.join('; ')}`),
        ),
      ),
    ),
  );

// -------------------------------------------------------------------------------------------------

const toHttpError = ({ statusCode, message }: ResponseError): HttpError => {
  if (500 <= statusCode && statusCode < 600) return httpError.serverError({ statusCode, message });
  if (400 <= statusCode && statusCode < 500) return httpError.clientError({ statusCode, message });
  throw new Error(`Request failed with unsupported status code (${statusCode}: ${message})`);
};
